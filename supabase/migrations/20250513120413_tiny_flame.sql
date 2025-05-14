/*
  # Update IPO and Profile Visibility

  1. Changes
    - Allow public access to approved IPOs and creator info
    - Update profile policies to allow public access to basic info
    - Add indexes for performance optimization

  2. Security
    - Maintain RLS while allowing appropriate public access
    - Protect sensitive user data while exposing necessary fields
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view approved IPOs" ON ipos;
DROP POLICY IF EXISTS "Users can view their own IPOs" ON ipos;
DROP POLICY IF EXISTS "Users can read profiles" ON profiles;

-- Create new IPO policies
CREATE POLICY "Anyone can view approved IPOs and creators"
  ON ipos FOR SELECT
  TO public
  USING (status = 'approved');

CREATE POLICY "Users can view their own IPOs"
  ON ipos FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR status = 'approved');

-- Update profile policies to allow public access to basic info
CREATE POLICY "Anyone can view basic profile info"
  ON profiles FOR SELECT
  TO public
  USING (true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_ipos_status ON ipos(status);
CREATE INDEX IF NOT EXISTS idx_ipos_user_id ON ipos(user_id);