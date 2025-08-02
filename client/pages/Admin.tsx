import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Users, Eye, Shield, Trash2, Calendar, MapPin, Info, Mail, Key, MessageSquare, Plus, Clock, User, Search, Filter, Download, Ban, CheckCircle, XCircle, AlertCircle, TrendingUp, BarChart3, Map, Bell, Settings, UserCheck, UserX, Flag, FileText, Activity } from 'lucide-react';
import { useIssues } from '@/hooks/useIssues';
import { useAdmin } from '@/contexts/AdminContext';
import { useAuth } from '@/contexts/AuthContext';
import { ISSUE_CATEGORIES, ISSUE_STATUS } from '@/constants/categories';
import { Issue } from '@/lib/supabase';
import MapView from '@/components/MapView';

interface IssueUpdate {
  id: string;
  issueId: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  message: string;
  status: 'reported' | 'in_progress' | 'resolved';
  timestamp: Date;
}

interface User {
  id: string;
  email: string;
  full_name?: string;
  role: 'user' | 'admin' | 'moderator';
  status: 'active' | 'banned' | 'warning';
  reports_count: number;
  created_at: Date;
}

export default function Admin() {
  const { isAdmin, adminEmails } = useAdmin();
  const { user } = useAuth();
  const { issues, updateIssueStatus, deleteIssue } = useIssues();
  
  // State management
  const [selectedStatus, setSelectedStatus] = useState<Record<string, string>>({});
  const [issueUpdates, setIssueUpdates] = useState<Record<string, IssueUpdate[]>>({});
  const [updateDialogOpen, setUpdateDialogOpen] = useState<Record<string, boolean>>({});
  const [updateMessage, setUpdateMessage] = useState<Record<string, string>>({});
  const [updateStatus, setUpdateStatus] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showMap, setShowMap] = useState(false);

  // Mock users data (in real app, fetch from Supabase)
  const [users] = useState<User[]>([
    {
      id: '1',
      email: 'john@example.com',
      full_name: 'John Doe',
      role: 'user',
      status: 'active',
      reports_count: 5,
      created_at: new Date('2024-01-15')
    },
    {
      id: '2',
      email: 'admin@civictrack.com',
      full_name: 'Admin User',
      role: 'admin',
      status: 'active',
      reports_count: 0,
      created_at: new Date('2024-01-01')
    },
    {
      id: '3',
      email: 'spammer@example.com',
      full_name: 'Spam User',
      role: 'user',
      status: 'banned',
      reports_count: 15,
      created_at: new Date('2024-01-10')
    }
  ]);

  // Analytics calculations
  const stats = {
    total: issues.length,
    pending: issues.filter(issue => issue.status === 'reported').length,
    flagged: issues.filter(issue => issue.flagged).length,
    inProgress: issues.filter(issue => issue.status === 'in_progress').length,
    resolved: issues.filter(issue => issue.status === 'resolved').length,
    today: issues.filter(issue => 
      new Date(issue.created_at).toDateString() === new Date().toDateString()
    ).length,
    thisWeek: issues.filter(issue => {
      const issueDate = new Date(issue.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return issueDate >= weekAgo;
    }).length
  };

  // Category analytics
  const categoryStats = ISSUE_CATEGORIES.map(category => ({
    ...category,
    count: issues.filter(issue => issue.category === category.id).length
  })).sort((a, b) => b.count - a.count);

  // Filtered issues
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || issue.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleStatusChange = async (issueId: string, newStatus: 'reported' | 'in_progress' | 'resolved') => {
    try {
      await updateIssueStatus(issueId, newStatus);
      setSelectedStatus(prev => ({ ...prev, [issueId]: newStatus }));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDeleteIssue = async (issueId: string) => {
    if (confirm('Are you sure you want to delete this issue?')) {
      try {
        await deleteIssue(issueId);
      } catch (error) {
        console.error('Error deleting issue:', error);
      }
    }
  };

  const handlePostUpdate = async (issueId: string) => {
    if (!user || !updateMessage[issueId]?.trim()) return;

    const newUpdate: IssueUpdate = {
      id: Date.now().toString(),
      issueId,
      adminId: user.id,
      adminName: user.user_metadata?.full_name || 'Admin',
      adminEmail: user.email || '',
      message: updateMessage[issueId],
      status: (updateStatus[issueId] as 'reported' | 'in_progress' | 'resolved') || 'in_progress',
      timestamp: new Date(),
    };

    setIssueUpdates(prev => ({
      ...prev,
      [issueId]: [...(prev[issueId] || []), newUpdate]
    }));

    if (updateStatus[issueId] && updateStatus[issueId] !== issues.find(i => i.id === issueId)?.status) {
      await handleStatusChange(issueId, updateStatus[issueId] as any);
    }

    setUpdateMessage(prev => ({ ...prev, [issueId]: '' }));
    setUpdateStatus(prev => ({ ...prev, [issueId]: '' }));
    setUpdateDialogOpen(prev => ({ ...prev, [issueId]: false }));
  };

  const handleUserAction = (userId: string, action: 'ban' | 'warn' | 'activate') => {
    // In real app, this would update Supabase
    console.log(`User ${userId} ${action}ed`);
  };

  const exportData = (type: 'csv' | 'pdf') => {
    // In real app, this would generate and download file
    console.log(`Exporting ${type}...`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported': return 'status-reported';
      case 'in_progress': return 'status-in-progress';
      case 'resolved': return 'status-resolved';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'reported': return 'Reported';
      case 'in_progress': return 'In Progress';
      case 'resolved': return 'Resolved';
      default: return status;
    }
  };

  if (!isAdmin) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <Card className="card-professional max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Shield className="h-16 w-16 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold">Admin Access Required</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  You need admin privileges to access this panel.
                </p>
                
                {user ? (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4" />
                      <span className="font-medium">Current Email:</span>
                      <span className="text-muted-foreground">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Key className="h-4 w-4" />
                      <span className="font-medium">Admin Emails:</span>
                    </div>
                    <div className="space-y-1">
                      {adminEmails.map((email, index) => (
                        <div key={index} className="text-xs bg-white dark:bg-gray-700 p-2 rounded border">
                          {email}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium text-blue-800 dark:text-blue-200">How to get admin access:</span>
                    </div>
                    <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
                      <li>Sign up with one of the admin email addresses</li>
                      <li>Verify your email address</li>
                      <li>Sign in to access the admin panel</li>
                    </ol>
                  </div>
                )}

                <div className="flex gap-3 justify-center">
                  <Button asChild className="btn-primary">
                    <a href="/signup">Create Admin Account</a>
                  </Button>
                  <Button asChild variant="outline">
                    <a href="/login">Sign In</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">
            Comprehensive management and analytics for civic issues across your community.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="issues" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Issues
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Map View
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="card-professional">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>

              <Card className="card-professional">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Reports</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.today}</div>
                  <p className="text-xs text-muted-foreground">+{stats.thisWeek} this week</p>
                </CardContent>
              </Card>

              <Card className="card-professional">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Flagged Issues</CardTitle>
                  <Flag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.flagged}</div>
                  <p className="text-xs text-muted-foreground">Need attention</p>
                </CardContent>
              </Card>

              <Card className="card-professional">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.resolved}</div>
                  <p className="text-xs text-muted-foreground">{Math.round((stats.resolved / stats.total) * 100)}% success rate</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="card-professional">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full btn-primary" onClick={() => setActiveTab('issues')}>
                    <Eye className="h-4 w-4 mr-2" />
                    Review Pending Issues
                  </Button>
                  <Button className="w-full btn-secondary" onClick={() => setActiveTab('users')}>
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                  <Button className="w-full btn-secondary" onClick={() => setActiveTab('map')}>
                    <Map className="h-4 w-4 mr-2" />
                    View Map
                  </Button>
                </CardContent>
              </Card>

              <Card className="card-professional">
                <CardHeader>
                  <CardTitle>Top Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categoryStats.slice(0, 5).map((category) => (
                      <div key={category.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span className="text-sm">{category.label}</span>
                        </div>
                        <Badge variant="secondary">{category.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Issues Tab */}
          <TabsContent value="issues" className="space-y-6">
            {/* Filters */}
            <Card className="card-professional">
              <CardHeader>
                <CardTitle>Issue Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <Input
                      placeholder="Search issues..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="reported">Reported</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {ISSUE_CATEGORIES.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.icon} {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => exportData('csv')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>

                <div className="space-y-4">
                  {filteredIssues.map((issue) => {
                    const category = ISSUE_CATEGORIES.find(c => c.id === issue.category);
                    const updates = issueUpdates[issue.id] || [];

                    return (
                      <div key={issue.id} className="border rounded-lg p-6 dark:border-gray-700">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-lg">{category?.icon}</span>
                              <h3 className="font-semibold text-lg">{issue.title}</h3>
                              <Badge className={getStatusColor(issue.status)}>
                                {getStatusLabel(issue.status)}
                              </Badge>
                              {issue.flagged && (
                                <Badge variant="destructive">Flagged</Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground mb-3">{issue.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(issue.created_at).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {issue.coordinates.lat.toFixed(4)}, {issue.coordinates.lng.toFixed(4)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <Select
                              value={selectedStatus[issue.id] || issue.status}
                              onValueChange={(value) => handleStatusChange(issue.id, value as any)}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="reported">Reported</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                              </SelectContent>
                            </Select>

                            <Dialog open={updateDialogOpen[issue.id]} onOpenChange={(open) => 
                              setUpdateDialogOpen(prev => ({ ...prev, [issue.id]: open }))
                            }>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="btn-secondary">
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Post Update
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Post Update for Issue</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium mb-2 block">Update Status</label>
                                    <Select
                                      value={updateStatus[issue.id] || issue.status}
                                      onValueChange={(value) => setUpdateStatus(prev => ({ ...prev, [issue.id]: value }))}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="reported">Reported</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="resolved">Resolved</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium mb-2 block">Update Message</label>
                                    <Textarea
                                      placeholder="Describe the progress, actions taken, or resolution details..."
                                      value={updateMessage[issue.id] || ''}
                                      onChange={(e) => setUpdateMessage(prev => ({ ...prev, [issue.id]: e.target.value }))}
                                      rows={4}
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <Button 
                                      onClick={() => handlePostUpdate(issue.id)}
                                      disabled={!updateMessage[issue.id]?.trim()}
                                      className="btn-primary"
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Post Update
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      onClick={() => setUpdateDialogOpen(prev => ({ ...prev, [issue.id]: false }))}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>

                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteIssue(issue.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {issue.images.length > 0 && (
                          <div className="flex gap-2 mb-4">
                            {issue.images.slice(0, 3).map((image, index) => (
                              <img
                                key={index}
                                src={image}
                                alt={`Issue ${index + 1}`}
                                className="w-16 h-16 object-cover rounded"
                              />
                            ))}
                            {issue.images.length > 3 && (
                              <div className="w-16 h-16 bg-muted rounded flex items-center justify-center text-xs">
                                +{issue.images.length - 3}
                              </div>
                            )}
                          </div>
                        )}

                        {updates.length > 0 && (
                          <div className="border-t pt-4 mt-4">
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <MessageSquare className="h-4 w-4" />
                              Admin Updates ({updates.length})
                            </h4>
                            <div className="space-y-3">
                              {updates.map((update) => (
                                <div key={update.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4 text-muted-foreground" />
                                      <span className="font-medium text-sm">{update.adminName}</span>
                                      <Badge className={getStatusColor(update.status)}>
                                        {getStatusLabel(update.status)}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Clock className="h-3 w-3" />
                                      {update.timestamp.toLocaleString()}
                                    </div>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{update.message}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {filteredIssues.length === 0 && (
                    <div className="text-center py-8">
                      <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Issues Found</h3>
                      <p className="text-muted-foreground">
                        Try adjusting your filters or search terms.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="card-professional">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="border rounded-lg p-4 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-semibold">
                            {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold">{user.full_name || 'Anonymous'}</h3>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                {user.role}
                              </Badge>
                              <Badge variant={
                                user.status === 'active' ? 'default' : 
                                user.status === 'banned' ? 'destructive' : 'secondary'
                              }>
                                {user.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {user.reports_count} reports
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {user.status === 'active' ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUserAction(user.id, 'warn')}
                              >
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Warn
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleUserAction(user.id, 'ban')}
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                Ban
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUserAction(user.id, 'activate')}
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              Activate
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Map Tab */}
          <TabsContent value="map" className="space-y-6">
            <Card className="card-professional">
              <CardHeader>
                <CardTitle>Geographic Issue Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[600px] rounded-lg overflow-hidden">
                  <MapView
                    issues={issues}
                    center={{ lat: 40.7589, lng: -73.9851 }}
                    onIssueClick={setSelectedIssue}
                    selectedIssue={selectedIssue}
                    className="w-full h-full"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="card-professional">
                <CardHeader>
                  <CardTitle>Category Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categoryStats.map((category) => (
                      <div key={category.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span className="text-sm">{category.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${(category.count / stats.total) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{category.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="card-professional">
                <CardHeader>
                  <CardTitle>Status Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Reported</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-500 h-2 rounded-full" 
                            style={{ width: `${(stats.pending / stats.total) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{stats.pending}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">In Progress</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${(stats.inProgress / stats.total) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{stats.inProgress}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Resolved</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${(stats.resolved / stats.total) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{stats.resolved}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="card-professional">
              <CardHeader>
                <CardTitle>Admin Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Email Notifications</h3>
                    <p className="text-sm text-muted-foreground">Receive alerts for new issues</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Auto-approval</h3>
                    <p className="text-sm text-muted-foreground">Automatically approve certain issues</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Export Settings</h3>
                    <p className="text-sm text-muted-foreground">Configure data export options</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
