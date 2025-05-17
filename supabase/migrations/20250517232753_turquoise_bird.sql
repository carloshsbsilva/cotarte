/*
  # Portfolio and Market Value System

  1. New Tables
    - portfolios: Tracks user portfolio values and investments
  
  2. Changes
    - Add market value columns to artworks table
    - Add functions for market value calculation
    - Add triggers for automatic updates
  
  3. Security
    - Enable RLS on portfolios table
    - Add policy for users to view their own portfolio
*/

-- Create portfolios table if it doesn't exist
CREATE TABLE IF NOT EXISTS portfolios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL UNIQUE,
  total_value numeric NOT NULL DEFAULT 0,
  total_invested numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add market value columns to artworks if they don't exist
ALTER TABLE artworks
ADD COLUMN IF NOT EXISTS original_price numeric NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS market_value numeric NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS shares_sold integer NOT NULL DEFAULT 0;

-- Enable RLS if not already enabled
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can view their own portfolio" ON portfolios;

-- Create policy
CREATE POLICY "Users can view their own portfolio"
  ON portfolios FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create or replace function to initialize portfolio
CREATE OR REPLACE FUNCTION initialize_user_portfolio()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO portfolios (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop and recreate trigger on profile creation
DROP TRIGGER IF EXISTS on_profile_created ON profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_portfolio();

-- Create or replace function to calculate market value
CREATE OR REPLACE FUNCTION calculate_artwork_market_value(
  p_artwork_id uuid
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_original_price numeric;
  v_total_shares integer;
  v_shares_sold integer;
  v_market_value numeric;
BEGIN
  -- Get artwork details
  SELECT 
    original_price,
    total_shares,
    shares_sold
  INTO
    v_original_price,
    v_total_shares,
    v_shares_sold
  FROM artworks
  WHERE id = p_artwork_id;

  -- Calculate market value using the formula:
  -- market_value = original_price × (1 + (shares_sold ÷ total_shares))
  v_market_value := v_original_price * (1 + (v_shares_sold::numeric / v_total_shares::numeric));

  -- If all shares are sold, double the market value
  IF v_shares_sold = v_total_shares THEN
    v_market_value := v_market_value * 2;
  END IF;

  -- Update artwork market value
  UPDATE artworks
  SET 
    market_value = v_market_value,
    updated_at = now()
  WHERE id = p_artwork_id;

  RETURN v_market_value;
END;
$$;

-- Create or replace function to update portfolio value
CREATE OR REPLACE FUNCTION update_portfolio_value(
  p_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_value numeric;
BEGIN
  -- Calculate total value from user shares
  SELECT COALESCE(SUM(us.shares * a.market_value / a.total_shares), 0)
  INTO v_total_value
  FROM user_shares us
  JOIN artworks a ON a.id = us.artwork_id
  WHERE us.user_id = p_user_id;

  -- Update portfolio
  UPDATE portfolios
  SET 
    total_value = v_total_value,
    updated_at = now()
  WHERE user_id = p_user_id;
END;
$$;

-- Create or replace trigger function to update market value on share transfer
CREATE OR REPLACE FUNCTION update_market_value_on_transfer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  r_shareholder RECORD;
BEGIN
  -- Update shares sold count
  UPDATE artworks
  SET shares_sold = shares_sold + NEW.shares
  WHERE id = NEW.artwork_id;

  -- Recalculate market value
  PERFORM calculate_artwork_market_value(NEW.artwork_id);

  -- Update portfolio values for all shareholders
  FOR r_shareholder IN (
    SELECT DISTINCT user_id 
    FROM user_shares 
    WHERE artwork_id = NEW.artwork_id
  ) LOOP
    PERFORM update_portfolio_value(r_shareholder.user_id);
  END LOOP;

  RETURN NEW;
END;
$$;

-- Drop and recreate trigger on user_shares
DROP TRIGGER IF EXISTS on_share_transfer ON user_shares;
CREATE TRIGGER on_share_transfer
  AFTER INSERT OR UPDATE ON user_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_market_value_on_transfer();