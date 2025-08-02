import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Filter, Grid, Map as MapIcon, AlertCircle, Loader2, TrendingUp, Users, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Layout from '@/components/Layout';
import MapView from '@/components/MapView';
import IssueCard from '@/components/IssueCard';
import FilterSidebar from '@/components/FilterSidebar';
import { Coordinates, getCurrentLocation, filterIssuesByDistance, calculateDistance } from '@/utils/geoUtils';
import { useIssues } from '@/hooks/useIssues';
import { Issue } from '@/lib/supabase';

interface FilterState {
  search: string;
  categories: string[];
  statuses: string[];
  distance: number;
}

export default function Index() {
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'feed' | 'map'>('feed');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    categories: [],
    statuses: [],
    distance: 5,
  });

  const { issues, loading: issuesLoading, upvoteIssue, flagIssue } = useIssues();

  // Get user location on mount
  useEffect(() => {
    getCurrentLocation()
      .then(setUserLocation)
      .catch((error) => {
        setLocationError(error.message);
        // Fallback to NYC coordinates for demo
        setUserLocation({ lat: 40.7589, lng: -73.9851 });
      });
  }, []);

  // Filter issues based on user preferences and location
  const filteredIssues = userLocation ?
    filterIssuesByDistance(issues, userLocation, filters.distance)
      .filter(issue => {
        // Search filter
        if (filters.search && !issue.title.toLowerCase().includes(filters.search.toLowerCase()) &&
            !issue.description.toLowerCase().includes(filters.search.toLowerCase())) {
          return false;
        }

        // Category filter
        if (filters.categories.length > 0 && !filters.categories.includes(issue.category)) {
          return false;
        }

        // Status filter
        if (filters.statuses.length > 0 && !filters.statuses.includes(issue.status)) {
          return false;
        }

        // Hide flagged issues
        if (issue.flagged) {
          return false;
        }

        return true;
      })
      .map(issue => ({
        ...issue,
        distance: calculateDistance(userLocation, issue.coordinates)
      }))
      .sort((a, b) => a.distance - b.distance)
    : [];

  if (!userLocation || issuesLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md mx-4 card-professional">
            <CardContent className="p-8 text-center">
              <div className="relative">
                <Loader2 className="h-16 w-16 text-primary mx-auto mb-6 animate-spin" />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-xl"></div>
              </div>
              <h2 className="text-2xl font-bold mb-3 text-gradient">
                {!userLocation ? 'Getting your location...' : 'Loading issues...'}
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {!userLocation
                  ? 'We need your location to show nearby civic issues.'
                  : 'Fetching the latest civic issues in your area.'
                }
              </p>
              {locationError && (
                <Alert className="mb-4 card-glass">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {locationError}. Using demo location for now.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex min-h-screen">
        {/* Filter Sidebar */}
        <FilterSidebar
          filters={filters}
          onFiltersChange={setFilters}
          issueCount={filteredIssues.length}
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
        />

        {/* Main Content - Removed all horizontal spacing */}
        <div className="flex-1 w-0">
          {/* Enhanced Hero Section */}
          <div className="hero-gradient hero-pattern relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20"></div>
            <div className="relative px-4 py-20 text-center">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white fade-in-up">
                  Empowering Citizens.<br />
                  <span className="text-accent-foreground">Enhancing Cities.</span>
                </h1>
                <p className="text-xl md:text-2xl mb-10 text-white/90 max-w-3xl mx-auto slide-up leading-relaxed">
                  Track is a platform where citizens can report local problems and track their resolution in real-time. 
                  Join thousands of community members making their neighborhoods better.
                </p>
                
                {/* Enhanced Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 slide-up">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                    <TrendingUp className="h-8 w-8 text-white mx-auto mb-3" />
                    <div className="text-2xl font-bold text-white">2,847</div>
                    <div className="text-white/80 text-sm">Issues Resolved</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                    <Users className="h-8 w-8 text-white mx-auto mb-3" />
                    <div className="text-2xl font-bold text-white">15,234</div>
                    <div className="text-white/80 text-sm">Active Users</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                    <CheckCircle className="h-8 w-8 text-white mx-auto mb-3" />
                    <div className="text-2xl font-bold text-white">94%</div>
                    <div className="text-white/80 text-sm">Success Rate</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center slide-up">
                  <Link to="/report" className="cta-button inline-flex items-center gap-3 group">
                    <MapPin className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    Report an Issue
                  </Link>
                  <button
                    onClick={() => setViewMode(viewMode === 'feed' ? 'map' : 'feed')}
                    className="bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/30 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95"
                  >
                    View {viewMode === 'feed' ? 'Map' : 'Feed'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Issues Header - Removed all horizontal spacing */}
          <div className="bg-white shadow-professional sticky top-16 z-30 border-b border-gray-100">
            <div className="px-4 py-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-2">Civic Issues Near You</h2>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Within {filters.distance} km
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {filteredIssues.length} issues found
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Enhanced Filter Toggle (Mobile) */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="lg:hidden btn-secondary"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>

                  {/* Enhanced View Mode Toggle */}
                  <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden shadow-professional">
                    <Button
                      variant={viewMode === 'feed' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('feed')}
                      className={`rounded-r-none px-6 py-3 ${viewMode === 'feed' ? 'btn-primary' : 'hover:bg-gray-50'}`}
                    >
                      <Grid className="h-4 w-4 mr-2" />
                      Feed
                    </Button>
                    <Button
                      variant={viewMode === 'map' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('map')}
                      className={`rounded-l-none px-6 py-3 ${viewMode === 'map' ? 'btn-primary' : 'hover:bg-gray-50'}`}
                    >
                      <MapIcon className="h-4 w-4 mr-2" />
                      Map
                    </Button>
                  </div>
                </div>
              </div>

              {/* Enhanced Location info */}
              {locationError && (
                <Alert className="mb-4 card-glass">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Unable to get precise location: {locationError}. Showing demo data.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Enhanced Content Area - Removed all horizontal spacing */}
          <div className="px-4">
            {viewMode === 'feed' ? (
              /* Enhanced Issue Feed */
              <div className="space-y-6 py-6">
                {filteredIssues.length === 0 ? (
                  <Card className="card-professional">
                    <CardContent className="p-12 text-center">
                      <div className="relative mb-6">
                        <MapPin className="h-16 w-16 text-muted-foreground mx-auto" />
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-xl"></div>
                      </div>
                      <h3 className="text-2xl font-bold mb-3 text-gradient">No issues found</h3>
                      <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
                        Try adjusting your filters or expanding your search radius to see more civic issues in your area.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-6">
                    {filteredIssues.map((issue, index) => (
                      <div key={issue.id} className="fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                        <IssueCard
                          issue={issue}
                          showDistance={issue.distance}
                          onUpvote={upvoteIssue}
                          onFlag={flagIssue}
                          onClick={(issue) => setSelectedIssue(issue)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Enhanced Map View */
              <div className="space-y-6 py-6">
                <div className="card-professional overflow-hidden">
                  <MapView
                    issues={filteredIssues}
                    center={userLocation}
                    onIssueClick={setSelectedIssue}
                    selectedIssue={selectedIssue}
                    className="h-[70vh]"
                  />
                </div>
                
                {/* Enhanced Selected Issue Details */}
                {selectedIssue && (
                  <Card className="card-professional slide-in-right">
                    <CardContent className="p-6">
                      <IssueCard
                        issue={selectedIssue}
                        showDistance={calculateDistance(userLocation, selectedIssue.coordinates)}
                        onUpvote={upvoteIssue}
                        onFlag={flagIssue}
                        onClick={(issue) => console.log('Navigate to issue detail:', issue)}
                      />
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
