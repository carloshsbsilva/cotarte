/*
  # Share Management System

  1. New Tables
    - `available_shares`
      - Tracks available shares for each artwork
      - Includes current price per share
      - Maintains share count and pricing history

  2. Functions
    - `handle_share_transaction`: Manages share transfers between users
    - `handle_transaction_status_change`: Updates share availability on transaction completion

  3. Security
    - Enable RLS on new tables
    - Add policies for share visibility
*/

-- Create available_shares table if it doesn't exist
CREATE TABLE IF NOT EXISTS available_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id uuid REFERENCES artworks(id) NOT NULL,
  shares integer NOT NULL,
  price_per_share numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(artwork_id)
);

-- Enable RLS on available_shares
ALTER TABLE available_shares ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view available shares" ON available_shares;

-- Create policy for viewing available shares
CREATE POLICY "Anyone can view available shares"
  ON available_shares FOR SELECT
  TO authenticated
  USING (true);

-- Function to handle share transactions
CREATE OR REPLACE FUNCTION handle_share_transaction(
  p_artwork_id uuid,
  p_user_id uuid,
  p_shares integer,
  p_price_per_share numeric,
  p_transaction_type text,
  p_payment_id text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_transaction_id uuid;
BEGIN
  -- For sell transactions, verify user has enough shares
  IF p_transaction_type = 'sell' THEN
    IF NOT EXISTS (
      SELECT 1 FROM user_shares
      WHERE user_id = p_user_id
      AND artwork_id = p_artwork_id
      AND shares >= p_shares
    ) THEN
      RAISE EXCEPTION 'Insufficient shares';
    END IF;
  END IF;

  -- Create transaction record
  INSERT INTO transactions (
    user_id,
    artwork_id,
    type,
    shares,
    price_per_share,
    total_amount,
    stripe_payment_intent_id,
    status
  )
  VALUES (
    p_user_id,
    p_artwork_id,
    p_transaction_type,
    p_shares,
    p_price_per_share,
    p_shares * p_price_per_share,
    p_payment_id,
    'completed'
  )
  RETURNING id INTO v_transaction_id;

  -- Update user shares
  IF p_transaction_type = 'buy' THEN
    -- For buy transactions, add shares to user's account
    INSERT INTO user_shares (user_id, artwork_id, shares)
    VALUES (p_user_id, p_artwork_id, p_shares)
    ON CONFLICT (user_id, artwork_id)
    DO UPDATE SET shares = user_shares.shares + p_shares;

    -- Remove shares from available pool
    UPDATE available_shares
    SET shares = shares - p_shares
    WHERE artwork_id = p_artwork_id;
  ELSE
    -- For sell transactions, remove shares from user's account
    UPDATE user_shares
    SET shares = shares - p_shares
    WHERE user_id = p_user_id AND artwork_id = p_artwork_id;

    -- Add shares back to available pool
    INSERT INTO available_shares (artwork_id, shares, price_per_share)
    VALUES (p_artwork_id, p_shares, p_price_per_share)
    ON CONFLICT (artwork_id)
    DO UPDATE SET
      shares = available_shares.shares + EXCLUDED.shares,
      price_per_share = EXCLUDED.price_per_share,
      updated_at = now();
  END IF;

  RETURN v_transaction_id;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS transaction_status_change ON transactions;

-- Create or replace trigger function
CREATE OR REPLACE FUNCTION handle_transaction_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status = 'pending' THEN
    -- Handle completed transaction
    IF NEW.type = 'buy' THEN
      -- Remove shares from available pool
      UPDATE available_shares
      SET shares = shares - NEW.shares
      WHERE artwork_id = NEW.artwork_id;
    ELSE
      -- Add shares back to available pool
      INSERT INTO available_shares (artwork_id, shares, price_per_share)
      VALUES (NEW.artwork_id, NEW.shares, NEW.price_per_share)
      ON CONFLICT (artwork_id)
      DO UPDATE SET
        shares = available_shares.shares + EXCLUDED.shares,
        price_per_share = NEW.price_per_share,
        updated_at = now();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for transaction status changes
CREATE TRIGGER transaction_status_change
  AFTER UPDATE OF status ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION handle_transaction_status_change();