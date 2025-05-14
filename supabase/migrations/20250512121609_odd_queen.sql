/*
  # Add RLS policies for profiles table

  1. Security
    - Enable RLS on profiles table
    - Add policies for:
      - Users can read their own profile
      - Users can create their own profile
      - Users can update their own profile
      - Users can read other users' basic info
*/

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to create their own profile
CREATE POLICY "Users can create own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow users to read other users' basic info (name, avatar)
CREATE POLICY "Users can view other users' basic info"
ON profiles
FOR SELECT
TO authenticated
USING (true);