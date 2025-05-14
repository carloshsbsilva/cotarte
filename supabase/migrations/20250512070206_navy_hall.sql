-- Add transaction types for deposits and withdrawals
ALTER TABLE transactions
DROP CONSTRAINT IF EXISTS transactions_type_check,
ADD CONSTRAINT transactions_type_check 
  CHECK (type IN ('buy', 'sell', 'deposit', 'withdrawal'));

-- Add amount column for non-share transactions
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS amount numeric;

-- Add transfer_id for withdrawals
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS stripe_transfer_id text;

-- Create function to process withdrawal
CREATE OR REPLACE FUNCTION process_withdrawal(
  p_user_id uuid,
  p_amount numeric,
  p_transfer_id text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify user has enough balance
  IF NOT EXISTS (
    SELECT 1 FROM wallets
    WHERE user_id = p_user_id
    AND balance >= p_amount
  ) THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Deduct amount from wallet
  UPDATE wallets
  SET balance = balance - p_amount,
      updated_at = now()
  WHERE user_id = p_user_id;

  -- Create transaction record
  INSERT INTO transactions (
    user_id,
    type,
    amount,
    stripe_transfer_id,
    status
  ) VALUES (
    p_user_id,
    'withdrawal',
    p_amount,
    p_transfer_id,
    'completed'
  );
END;
$$;