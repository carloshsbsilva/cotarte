/*
  # IPO System Implementation

  1. New Tables
    - `ipos`
      - Tracks IPO submissions and their status
      - Includes artwork details and validation status
    - `wallets`
      - Tracks user balances for IPO fees

  2. Changes
    - Add IPO-related columns to artworks table
    - Add policies for IPO management
    - Add functions for IPO processing
*/

-- Create wallets table
CREATE TABLE wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL UNIQUE,
  balance numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ipos table
CREATE TABLE ipos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  category text NOT NULL,
  price_per_share numeric NOT NULL,
  total_shares integer NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_feedback text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add IPO-related columns to artworks
ALTER TABLE artworks
ADD COLUMN ipo_id uuid REFERENCES ipos(id),
ADD COLUMN status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive'));

-- Enable RLS
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ipos ENABLE ROW LEVEL SECURITY;

-- Create policies for wallets
CREATE POLICY "Users can view their own wallet"
  ON wallets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for IPOs
CREATE POLICY "Users can view their own IPOs"
  ON ipos FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

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

-- Create function to process IPO approval
CREATE OR REPLACE FUNCTION approve_ipo(
  p_ipo_id uuid,
  p_admin_feedback text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ipo_fee numeric;
  v_user_id uuid;
BEGIN
  -- Get IPO details
  SELECT user_id, (price_per_share * total_shares * 0.05) -- 5% IPO fee
  INTO v_user_id, v_ipo_fee
  FROM ipos
  WHERE id = p_ipo_id;

  -- Check if user has enough balance
  IF NOT EXISTS (
    SELECT 1 FROM wallets
    WHERE user_id = v_user_id
    AND balance >= v_ipo_fee
  ) THEN
    RAISE EXCEPTION 'Insufficient balance for IPO fee';
  END IF;

  -- Deduct IPO fee
  UPDATE wallets
  SET balance = balance - v_ipo_fee
  WHERE user_id = v_user_id;

  -- Update IPO status
  UPDATE ipos
  SET status = 'approved',
      admin_feedback = p_admin_feedback,
      updated_at = now()
  WHERE id = p_ipo_id;

  -- Create artwork
  INSERT INTO artworks (
    title,
    artist,
    description,
    image_url,
    price_per_share,
    total_shares,
    category,
    ipo_id,
    status
  )
  SELECT
    i.title,
    p.name,
    i.description,
    i.image_url,
    i.price_per_share,
    i.total_shares,
    i.category,
    i.id,
    'active'
  FROM ipos i
  JOIN profiles p ON p.id = i.user_id
  WHERE i.id = p_ipo_id;
END;
$$;

-- Create function to reject IPO
CREATE OR REPLACE FUNCTION reject_ipo(
  p_ipo_id uuid,
  p_admin_feedback text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE ipos
  SET status = 'rejected',
      admin_feedback = p_admin_feedback,
      updated_at = now()
  WHERE id = p_ipo_id;
END;
$$;

-- Add triggers for updated_at
CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ipos_updated_at
  BEFORE UPDATE ON ipos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();