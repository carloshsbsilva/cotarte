/*
  # Profile Management Updates
  
  1. Changes
    - Add email column to profiles
    - Add trigger to set initial profile data from auth.users
    - Add function to update profile
    - Configure storage for avatars
*/

-- Add email column if not exists
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS email text;

-- Create function to set initial profile data
CREATE OR REPLACE FUNCTION set_initial_profile_data()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_email text;
  v_name text;
BEGIN
  -- Get email from auth.users
  SELECT email INTO v_email
  FROM auth.users
  WHERE id = NEW.id;

  -- Set email
  NEW.email = v_email;
  
  -- Extract name from email (before @)
  v_name = split_part(v_email, '@', 1);
  -- Replace dots and underscores with spaces
  v_name = regexp_replace(v_name, '[._]', ' ', 'g');
  -- Capitalize first letter of each word
  NEW.name = initcap(v_name);
  
  RETURN NEW;
END;
$$;

-- Create trigger to set initial profile data
DROP TRIGGER IF EXISTS set_profile_data ON profiles;
CREATE TRIGGER set_profile_data
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_initial_profile_data();

-- Create function to update profile
CREATE OR REPLACE FUNCTION update_profile(
  p_user_id uuid,
  p_name text,
  p_avatar_url text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET
    name = p_name,
    avatar_url = COALESCE(p_avatar_url, avatar_url),
    updated_at = now()
  WHERE id = p_user_id;
END;
$$;

-- Enable storage for avatars if not already enabled
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;

-- Allow authenticated users to upload avatars
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow anyone to view avatars
CREATE POLICY "Anyone can view avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');