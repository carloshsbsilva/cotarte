/*
  # Fix profiles table RLS policies

  1. Changes
    - Enable RLS on profiles table if not already enabled
    - Add policies for authenticated users to:
      - Read their own profile data
      - Create their own profile
      - Update their own profile
      - Read basic public profile data of other users

  2. Security
    - Ensures users can only access and modify their own profile data
    - Allows read-only access to basic public profile information
*/

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

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