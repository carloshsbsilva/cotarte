/*
  # Add profile fields and policies

  1. Changes
    - Add new columns to profiles table:
      - bio (text)
      - role (text, either 'artist' or 'investor')
      - phone (text)
      - website (text)
    - Add policies for profile management
*/

-- Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS role text CHECK (role IN ('artist', 'investor')),
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS website text;

-- Add policy for profile creation
CREATE POLICY "Users can create their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Add policy for profile deletion
CREATE POLICY "Users can delete their own profile"
  ON profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);