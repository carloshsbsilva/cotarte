/*
  # Add Stripe webhook handling

  1. Changes
    - Add stripe_customer_id to profiles
    - Add function to process deposits
*/

-- Add stripe_customer_id to profiles if not exists
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id text;

-- Create function to process deposit
CREATE OR REPLACE FUNCTION process_deposit(
  p_user_id uuid,
  p_amount numeric,
  p_payment_intent_id text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Add amount to user's wallet
  INSERT INTO wallets (user_id, balance)
  VALUES (p_user_id, p_amount)
  ON CONFLICT (user_id)
  DO UPDATE SET 
    balance = wallets.balance + p_amount,
    updated_at = now();

  -- Create transaction record
  INSERT INTO transactions (
    user_id,
    type,
    amount,
    stripe_payment_id,
    status
  ) VALUES (
    p_user_id,
    'deposit',
    p_amount,
    p_payment_intent_id,
    'completed'
  );
END;
$$;