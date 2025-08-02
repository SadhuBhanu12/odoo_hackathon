import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function IssueDetail() {
  const { id } = useParams();

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Feed
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Issue Detail Page</h3>
            <p className="text-muted-foreground mb-4">
              This page will show detailed information about issue #{id}, including:
            </p>
            <ul className="text-left text-muted-foreground space-y-1 max-w-md mx-auto">
              <li>• Complete issue description and images</li>
              <li>• Status timeline and updates</li>
              <li>• Location on interactive map</li>
              <li>• Comments and community discussion</li>
              <li>• Actions for admins and users</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
