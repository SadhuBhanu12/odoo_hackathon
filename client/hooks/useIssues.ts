import { useState, useEffect, useCallback } from 'react';
import { supabase, Issue } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Coordinates } from '@/utils/geoUtils';

export function useIssues() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIssues(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createIssue = async (issueData: {
    title: string;
    description: string;
    category: string;
    coordinates: Coordinates;
    images: string[];
    is_anonymous: boolean;
  }) => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .insert([
          {
            ...issueData,
            reported_by: user?.id,
            status: 'reported',
            upvotes: 0,
            flagged: false,
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      // Add to local state
      setIssues(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const updateIssue = async (id: string, updates: Partial<Issue>) => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setIssues(prev => prev.map(issue =>
        issue.id === id ? { ...issue, ...data } : issue
      ));
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const updateIssueStatus = async (id: string, status: 'reported' | 'in_progress' | 'resolved') => {
    return updateIssue(id, { status, updated_at: new Date().toISOString() });
  };

  const deleteIssue = async (id: string) => {
    try {
      const { error } = await supabase
        .from('issues')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setIssues(prev => prev.filter(issue => issue.id !== id));
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const upvoteIssue = async (id: string) => {
    try {
      // Get current issue
      const issue = issues.find(i => i.id === id);
      if (!issue) return;

      const newUpvotes = issue.upvotes + 1;
      
      const { error } = await supabase
        .from('issues')
        .update({ upvotes: newUpvotes })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setIssues(prev => prev.map(issue => 
        issue.id === id ? { ...issue, upvotes: newUpvotes } : issue
      ));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const flagIssue = async (id: string) => {
    try {
      const { error } = await supabase
        .from('issues')
        .update({ flagged: true })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setIssues(prev => prev.map(issue => 
        issue.id === id ? { ...issue, flagged: true } : issue
      ));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getUserIssues = useCallback(async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('reported_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err: any) {
      setError(err.message);
      return [];
    }
  }, [user]);

  useEffect(() => {
    fetchIssues();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('issues_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'issues' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setIssues(prev => [payload.new as Issue, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setIssues(prev => prev.map(issue => 
              issue.id === payload.new.id ? payload.new as Issue : issue
            ));
          } else if (payload.eventType === 'DELETE') {
            setIssues(prev => prev.filter(issue => issue.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    issues,
    loading,
    error,
    createIssue,
    updateIssue,
    updateIssueStatus,
    deleteIssue,
    upvoteIssue,
    flagIssue,
    getUserIssues,
    refetch: fetchIssues,
  };
}
