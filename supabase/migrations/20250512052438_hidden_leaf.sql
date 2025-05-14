-- Add role column to profiles
ALTER TABLE profiles
ADD COLUMN role text CHECK (role IN ('artist', 'investor', 'both'));

-- Update policies to allow role updates
CREATE POLICY "Users can update their own role"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);