/*
  # Update Share Management System

  1. Changes
    - Add unique constraint on artwork_id in available_shares
    - Update process_artwork_sale function to handle share pool
    - Add trigger for transaction status updates
*/

-- Add unique constraint to available_shares
ALTER TABLE available_shares
ADD CONSTRAINT available_shares_artwork_id_key UNIQUE (artwork_id);

-- Update process_artwork_sale function
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

  -- Add shares back to available pool
  INSERT INTO available_shares (artwork_id, shares, price_per_share)
  VALUES (p_artwork_id, p_shares, p_price_per_share)
  ON CONFLICT (artwork_id) 
  DO UPDATE SET 
    shares = available_shares.shares + EXCLUDED.shares,
    price_per_share = EXCLUDED.price_per_share,
    updated_at = now();

  RETURN v_transaction_id;
END;
$$;

-- Add trigger for transaction status updates
CREATE OR REPLACE FUNCTION handle_transaction_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- When a sell transaction is completed
  IF NEW.status = 'completed' AND NEW.type = 'sell' AND 
     (OLD.status IS NULL OR OLD.status != 'completed') THEN
    
    -- Add shares back to available pool
    INSERT INTO available_shares (artwork_id, shares, price_per_share)
    VALUES (NEW.artwork_id, NEW.shares, NEW.price_per_share)
    ON CONFLICT (artwork_id) 
    DO UPDATE SET 
      shares = available_shares.shares + EXCLUDED.shares,
      price_per_share = EXCLUDED.price_per_share,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transaction_status_change
  AFTER UPDATE OF status ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION handle_transaction_status_change();