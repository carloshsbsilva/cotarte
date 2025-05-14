/*
  # Update Profiles Schema

  1. Changes
    - Add first_name and last_name columns to profiles
    - Add bio column for user descriptions
    - Add profile_photo_url for storing profile photos
*/

-- Add new columns to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text,
ADD COLUMN IF NOT EXISTS bio text;

-- Create function to update profile
CREATE OR REPLACE FUNCTION update_profile(
  p_user_id uuid,
  p_first_name text,
  p_last_name text,
  p_bio text DEFAULT NULL,
  p_avatar_url text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET
    first_name = p_first_name,
    last_name = p_last_name,
    bio = p_bio,
    avatar_url = COALESCE(p_avatar_url, avatar_url),
    updated_at = now()
  WHERE id = p_user_id;
END;
$$;