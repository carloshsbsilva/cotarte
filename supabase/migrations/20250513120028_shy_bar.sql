/*
  # Update IPO Policies for Public Access

  1. Changes
    - Allow public access to approved IPOs and their creators
    - Update existing policies to maintain security
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view approved IPOs" ON ipos;
DROP POLICY IF EXISTS "Users can view their own IPOs" ON ipos;

-- Create new policies
CREATE POLICY "Anyone can view approved IPOs"
  ON ipos FOR SELECT
  TO public
  USING (status = 'approved');

CREATE POLICY "Users can view their own IPOs"
  ON ipos FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR status = 'approved');

-- Update artworks policy to allow public access
DROP POLICY IF EXISTS "Anyone can view artworks" ON artworks;

CREATE POLICY "Anyone can view artworks"
  ON artworks FOR SELECT
  TO public
  USING (true);