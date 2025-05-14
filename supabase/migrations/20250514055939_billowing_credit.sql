/*
  # Initialize User Portfolio

  1. Changes
    - Add trigger to create empty portfolio on user creation
    - Add function to initialize portfolio with zero values
    - Update portfolio update function to handle zero values
*/

-- Create function to initialize portfolio
CREATE OR REPLACE FUNCTION initialize_user_portfolio()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create portfolio with zero values
  INSERT INTO portfolios (
    user_id,
    total_value,
    total_invested
  )
  VALUES (
    NEW.id,
    0,
    0
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger to initialize portfolio on profile creation
DROP TRIGGER IF EXISTS on_profile_created ON profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_portfolio();

-- Update portfolio update function to handle zero values
CREATE OR REPLACE FUNCTION update_portfolio_value(
  p_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_value numeric;
  v_total_invested numeric;
BEGIN
  -- Calculate total current value from user shares
  SELECT 
    COALESCE(SUM(us.shares * a.market_value / a.total_shares), 0),
    COALESCE(SUM(us.shares * a.price_per_share), 0)
  INTO 
    v_total_value,
    v_total_invested
  FROM user_shares us
  JOIN artworks a ON a.id = us.artwork_id
  WHERE us.user_id = p_user_id
  AND us.shares > 0;

  -- Update portfolio
  UPDATE portfolios
  SET 
    total_value = v_total_value,
    total_invested = v_total_invested,
    updated_at = now()
  WHERE user_id = p_user_id;
END;
$$;