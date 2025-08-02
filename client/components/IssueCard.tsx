import { useState } from 'react';
import { Heart, Flag, MessageCircle, MapPin, Calendar, User, Eye, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Issue } from '@/utils/geoUtils';
import { ISSUE_CATEGORIES, ISSUE_STATUS } from '@/constants/categories';

interface IssueCardProps {
  issue: Issue;
  onUpvote?: (issueId: string) => void;
  onFlag?: (issueId: string) => void;
  onClick?: (issue: Issue) => void;
  showDistance?: number;
}

export default function IssueCard({ 
  issue, 
  onUpvote, 
  onFlag, 
  onClick,
  showDistance 
}: IssueCardProps) {
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(issue.upvotes);

  const category = ISSUE_CATEGORIES.find(c => c.id === issue.category);
  const status = ISSUE_STATUS.find(s => s.id === issue.status);

  const handleUpvote = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUpvoted(!isUpvoted);
    setUpvoteCount(prev => isUpvoted ? prev - 1 : prev + 1);
    onUpvote?.(issue.id);
  };

  const handleFlag = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFlag?.(issue.id);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const createdAt = issue.created_at || issue.createdAt;
  const reportedBy = issue.reported_by || issue.reportedBy;
  const isAnonymous = issue.is_anonymous !== undefined ? issue.is_anonymous : issue.isAnonymous;

  return (
    <Card
      className="issue-card group cursor-pointer"
      onClick={() => onClick?.(issue)}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10">
                <span className="text-lg">{category?.icon}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs font-medium px-3 py-1 rounded-full">
                  {category?.label}
                </Badge>
                <Badge className={`
                  ${status?.id === 'reported' ? 'status-reported' : ''}
                  ${status?.id === 'in_progress' ? 'status-in-progress' : ''}
                  ${status?.id === 'resolved' ? 'status-resolved' : ''}
                  font-medium px-3 py-1 rounded-full
                `}>
                  {status?.label}
                </Badge>
              </div>
            </div>
            <h3 className="font-bold text-xl leading-tight text-foreground group-hover:text-primary transition-colors duration-300">
              {issue.title}
            </h3>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <p className="text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
          {issue.description}
        </p>

        {/* Enhanced Images */}
        {issue.images.length > 0 && (
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-3">
              {issue.images.slice(0, 4).map((image, index) => (
                <div key={index} className="relative group/image">
                  <img
                    src={image}
                    alt={`Issue image ${index + 1}`}
                    className="w-full h-28 object-cover rounded-xl transition-all duration-300 group-hover/image:scale-105"
                  />
                  {index === 3 && issue.images.length > 4 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl backdrop-blur-sm">
                      <span className="text-white font-bold text-lg">
                        +{issue.images.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
            <Calendar className="h-3 w-3" />
            {formatTimeAgo(createdAt)}
          </div>

          {showDistance && (
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
              <MapPin className="h-3 w-3" />
              {showDistance.toFixed(1)} km away
            </div>
          )}

          {!isAnonymous && reportedBy && (
            <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
              <User className="h-3 w-3" />
              {typeof reportedBy === 'string' ? reportedBy : 'User'}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUpvote}
              className={`gap-2 interactive-hover ${isUpvoted ? 'text-red-500 bg-red-50' : 'text-muted-foreground hover:text-red-500 hover:bg-red-50'}`}
            >
              <Heart className={`h-4 w-4 ${isUpvoted ? 'fill-current' : ''}`} />
              <span className="font-medium">{upvoteCount}</span>
            </Button>

            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 interactive-hover text-muted-foreground hover:text-primary hover:bg-primary/10"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="font-medium">0</span>
            </Button>

            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 interactive-hover text-muted-foreground hover:text-primary hover:bg-primary/10"
            >
              <Eye className="h-4 w-4" />
              <span className="font-medium">View</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFlag}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 interactive-hover"
            >
              <Flag className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary hover:bg-primary/10 interactive-hover"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
