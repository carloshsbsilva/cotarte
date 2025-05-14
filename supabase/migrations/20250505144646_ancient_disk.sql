/*
  # Update Share Sales and Transaction History

  1. Changes
    - Add available_shares table to track shares available for purchase
    - Add functions to handle share sales and purchases
    - Add triggers to update available shares
    - Add views for transaction history
*/

-- Create available_shares table
CREATE TABLE IF NOT EXISTS available_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id uuid REFERENCES artworks(id) NOT NULL,
  shares integer NOT NULL,
  price_per_share numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on available_shares
ALTER TABLE available_shares ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing available shares
CREATE POLICY "Anyone can view available shares"
  ON available_shares FOR SELECT
  TO authenticated
  USING (true);

-- Function to add shares to available pool
CREATE OR REPLACE FUNCTION add_shares_to_pool(
  p_artwork_id uuid,
  p_shares integer,
  p_price_per_share numeric
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO available_shares (artwork_id, shares, price_per_share)
  VALUES (p_artwork_id, p_shares, p_price_per_share)
  ON CONFLICT (artwork_id)
  DO UPDATE SET 
    shares = available_shares.shares + p_shares,
    price_per_share = p_price_per_share,
    updated_at = now();
END;
$$;

-- Update process_artwork_sale function to add shares to pool
CREATE OR REPLACE FUNCTION process_artwork_sale(
  p_artwork_id uuid,
  p_user_id uuid,
  p_shares integer,
  p_price_per_share numeric,
  p_transfer_id text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_transaction_id uuid;
BEGIN
  -- Verify user has enough shares
  IF NOT EXISTS (
    SELECT 1 FROM user_shares
    WHERE user_id = p_user_id
    AND artwork_id = p_artwork_id
    AND shares >= p_shares
  ) THEN
    RAISE EXCEPTION 'Insufficient shares';
  END IF;

  -- Create transaction record
  INSERT INTO transactions (
    user_id,
    artwork_id,
    type,
    shares,
    price_per_share,
    total_amount,
    stripe_transfer_id,
    status
  )
  VALUES (
    p_user_id,
    p_artwork_id,
    'sell',
    p_shares,
    p_price_per_share,
    p_shares * p_price_per_share,
    p_transfer_id,
    'completed'
  )
  RETURNING id INTO v_transaction_id;

  -- Update user shares
  PERFORM update_user_shares(p_artwork_id, p_user_id, -p_shares);

  -- Add shares to available pool
  PERFORM add_shares_to_pool(p_artwork_id, p_shares, p_price_per_share);

  RETURN v_transaction_id;
END;
$$;

-- Create view for user transaction history
CREATE OR REPLACE VIEW user_transaction_history AS
SELECT 
  t.id,
  t.user_id,
  t.artwork_id,
  a.title as artwork_title,
  t.type,
  t.shares,
  t.price_per_share,
  t.total_amount,
  CASE 
    WHEN t.type = 'buy' THEN -t.total_amount
    WHEN t.type = 'sell' THEN t.total_amount
  END as profit_loss,
  t.status,
  t.created_at
FROM transactions t
JOIN artworks a ON t.artwork_id = a.id
WHERE t.status = 'completed'
ORDER BY t.created_at DESC;

-- Add trigger to update available_shares
CREATE OR REPLACE FUNCTION update_available_shares()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.type = 'buy' THEN
    UPDATE available_shares
    SET shares = shares - NEW.shares
    WHERE artwork_id = NEW.artwork_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_available_shares_after_transaction
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_available_shares();