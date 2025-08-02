import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Check if we're in demo mode (using placeholder credentials)
export const isDemoMode = supabaseUrl.includes('your-project') || supabaseAnonKey.includes('your-anon-key');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  images: string[];
  created_at: string;
  updated_at: string;
  reported_by: string;
  is_anonymous: boolean;
  upvotes: number;
  flagged: boolean;
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
}
