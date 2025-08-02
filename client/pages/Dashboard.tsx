import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Clock, MapPin, User, Loader2 } from 'lucide-react';
import { useIssues } from '@/hooks/useIssues';
import { useAuth } from '@/contexts/AuthContext';
import IssueCard from '@/components/IssueCard';
import { Issue } from '@/lib/supabase';

export default function Dashboard() {
  const { user } = useAuth();
  const { issues, getUserIssues, upvoteIssue, flagIssue } = useIssues();
  const [userIssues, setUserIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserIssues = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Filter from all issues instead of calling getUserIssues to avoid infinite loop
        const filteredIssues = issues.filter(issue => issue.reported_by === user.id);
        setUserIssues(filteredIssues);
      } catch (error) {
        console.error('Error loading user issues:', error);
        setUserIssues([]);
      } finally {
        setLoading(false);
      }
    };

    loadUserIssues();
  }, [user, issues]); // Removed getUserIssues dependency to prevent infinite loop

  const stats = {
    total: userIssues.length,
    inProgress: userIssues.filter(issue => issue.status === 'in_progress').length,
    resolved: userIssues.filter(issue => issue.status === 'resolved').length,
    reported: userIssues.filter(issue => issue.status === 'reported').length,
  };

  const avgResponseTime = userIssues.length > 0
    ? Math.round(userIssues.reduce((acc, issue) => {
        const created = new Date(issue.created_at);
        const updated = new Date(issue.updated_at);
        const diffDays = Math.abs(updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        return acc + diffDays;
      }, 0) / userIssues.length * 10) / 10
    : 0;

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Reports Dashboard</h1>
          <p className="text-muted-foreground">
            Track your submitted issues and see their progress.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.reported} pending review
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground">Being addressed</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.resolved}</div>
              <p className="text-xs text-muted-foreground">Successfully fixed</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgResponseTime}d</div>
              <p className="text-xs text-muted-foreground">Days to update</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Issues */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Your Recent Issues</CardTitle>
          </CardHeader>
          <CardContent>
            {userIssues.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No issues reported yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start making a difference by reporting civic issues in your area.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {userIssues.slice(0, 5).map((issue) => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    onUpvote={upvoteIssue}
                    onFlag={flagIssue}
                    onClick={(issue) => console.log('Navigate to issue:', issue)}
                  />
                ))}

                {userIssues.length > 5 && (
                  <div className="text-center pt-4">
                    <p className="text-sm text-muted-foreground">
                      Showing 5 of {userIssues.length} issues
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
