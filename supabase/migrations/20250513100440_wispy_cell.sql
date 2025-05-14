/*
  # Update IPO Visibility Policies

  1. Changes
    - Allow public access to approved IPOs
    - Keep existing policies for user-specific operations
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own IPOs" ON ipos;
DROP POLICY IF EXISTS "Admin can view all IPOs" ON ipos;
DROP POLICY IF EXISTS "Users can create IPOs" ON ipos;
DROP POLICY IF EXISTS "Admin can update IPO status" ON ipos;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON ipos;

-- Create new policies
CREATE POLICY "Anyone can view approved IPOs"
  ON ipos FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users can view their own IPOs"
  ON ipos FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create IPOs"
  ON ipos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all IPOs"
  ON ipos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Admin can update IPO status"
  ON ipos FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );