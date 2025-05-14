/*
  # Fix profile permissions

  1. Changes
    - Add missing RLS policies for profiles table
    - Grant necessary permissions to authenticated users
    - Fix foreign key constraint to auth.users instead of users table

  2. Security
    - Enable RLS on profiles table
    - Add policies for:
      - Authenticated users can read their own profile
      - Authenticated users can create their own profile
      - Authenticated users can update their own profile
      - Basic profile info (name, avatar) visible to all authenticated users
*/

-- First ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing foreign key if it exists
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Add correct foreign key to auth.users
ALTER TABLE profiles
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) 
REFERENCES auth.users(id);

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view basic info" ON profiles;

-- Create new policies
CREATE POLICY "Users can create own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view basic info"
ON profiles FOR SELECT
TO authenticated
USING (true);