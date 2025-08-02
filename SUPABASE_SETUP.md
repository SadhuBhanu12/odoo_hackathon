# Supabase Setup for Track Platform

## Prerequisites
1. Create a Supabase account at https://supabase.com
2. Create a new project in Supabase

## Database Setup

### 1. Create the Issues Table
Run this SQL in your Supabase SQL editor:

```sql
-- Create issues table
CREATE TABLE issues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(60) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'reported' CHECK (status IN ('reported', 'in_progress', 'resolved')),
  coordinates JSONB NOT NULL,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reported_by UUID REFERENCES auth.users(id),
  is_anonymous BOOLEAN DEFAULT FALSE,
  upvotes INTEGER DEFAULT 0,
  flagged BOOLEAN DEFAULT FALSE
);

-- Enable Row Level Security
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read issues (except flagged ones)
CREATE POLICY "Everyone can view non-flagged issues" ON issues
  FOR SELECT USING (flagged = FALSE);

-- Allow authenticated users to insert issues
CREATE POLICY "Authenticated users can insert issues" ON issues
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own issues
CREATE POLICY "Users can update own issues" ON issues
  FOR UPDATE USING (auth.uid() = reported_by);

-- Allow admins to update any issue
CREATE POLICY "Admins can update any issue" ON issues
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');
```

### 2. Create Storage Bucket
1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `images`
3. Make it public
4. Set up the following RLS policies:

```sql
-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

-- Allow everyone to view images
CREATE POLICY "Anyone can view images" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');
```

### 3. Create Functions and Triggers
```sql
-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_issues_updated_at BEFORE UPDATE
ON issues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Environment Configuration

### Set Environment Variables
Update your environment variables in the Builder.io platform:

1. Click on the project settings
2. Go to Environment Variables
3. Add the following variables:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Get Your Keys
1. Go to your Supabase project dashboard
2. Click on Settings > API
3. Copy the Project URL and anon/public key

## Authentication Setup

### Enable Email Authentication
1. Go to Authentication > Settings
2. Enable Email authentication
3. Configure your site URL: `https://your-app-domain.com`
4. Add redirect URLs if needed

### Optional: Enable OAuth Providers
- Google, GitHub, etc. can be enabled in the Authentication > Providers section

## Testing the Setup

1. Try creating an account through the signup page
2. Verify email confirmation (if enabled)
3. Log in and try reporting an issue
4. Check that the issue appears in your Supabase issues table

## Database Schema Summary

### Issues Table
- `id`: UUID (Primary Key)
- `title`: VARCHAR(60) - Issue title
- `description`: TEXT - Detailed description
- `category`: VARCHAR(50) - Issue category (roads, lighting, etc.)
- `status`: VARCHAR(20) - Current status (reported, in_progress, resolved)
- `coordinates`: JSONB - Location data {lat, lng}
- `images`: TEXT[] - Array of image URLs
- `created_at`: TIMESTAMP - When issue was created
- `updated_at`: TIMESTAMP - Last update time
- `reported_by`: UUID - User who reported (foreign key to auth.users)
- `is_anonymous`: BOOLEAN - Whether report is anonymous
- `upvotes`: INTEGER - Number of upvotes
- `flagged`: BOOLEAN - Whether issue is flagged for review

### Storage
- `images` bucket for storing issue photos
- Public read access, authenticated write access

## Ready to Use!

Once you've completed this setup:
1. Users can sign up and log in
2. Authenticated users can report issues with photos
3. Issues are stored in your Supabase database
4. Real-time updates work automatically
5. Users can view their own dashboard with their reported issues

The platform is now fully functional with persistent data storage!
