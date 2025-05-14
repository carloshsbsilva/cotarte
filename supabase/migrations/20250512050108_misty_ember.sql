/*
  # Add User Activity Tracking

  1. Changes
    - Add last_active_at column to profiles table
    - Add function to update user activity
    - Add view for active users
*/

-- Add last_active_at column to profiles
ALTER TABLE profiles
ADD COLUMN last_active_at timestamptz DEFAULT now();

-- Create function to update user activity
CREATE OR REPLACE FUNCTION update_user_activity(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET last_active_at = now()
  WHERE id = user_id;
END;
$$;

-- Create view for active users
CREATE OR REPLACE VIEW active_users AS
SELECT 
  p.id,
  p.name,
  p.email,
  p.avatar_url,
  p.last_active_at,
  (now() - p.last_active_at) as idle_duration
FROM profiles p
WHERE p.last_active_at > now() - interval '10 minutes'
ORDER BY p.last_active_at DESC;

-- Add RLS policy for active users view
CREATE POLICY "Authenticated users can view active users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);