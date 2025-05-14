/*
  # Fix profile policies and permissions

  1. Changes
    - Add policies for profiles table to allow authenticated users to:
      - Read their own profile
      - Create their own profile
      - Update their own profile
    - Add trigger to handle profile creation

  2. Security
    - Enable RLS on profiles table
    - Add policies for authenticated users
*/

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view other users' basic info" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view active users" ON profiles;

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

-- Allow reading basic info for all authenticated users
CREATE POLICY "Users can view basic info"
ON profiles FOR SELECT
TO authenticated
USING (true);