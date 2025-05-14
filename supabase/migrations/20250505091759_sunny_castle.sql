/*
  # Add Stripe-related functions and policies

  1. New Functions
    - update_user_shares: Updates user's share count for an artwork
    - process_artwork_purchase: Handles the purchase transaction
    - process_artwork_sale: Handles the sale transaction

  2. Changes
    - Add stripe_customer_id to profiles table
    - Add stripe-related columns to transactions table
*/

-- Add stripe_customer_id to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id text;

-- Add stripe-related columns to transactions
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
ADD COLUMN IF NOT EXISTS stripe_transfer_id text,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed'));

-- Function to update user shares
CREATE OR REPLACE FUNCTION update_user_shares(
  p_artwork_id uuid,
  p_user_id uuid,
  p_shares integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_shares (user_id, artwork_id, shares)
  VALUES (p_user_id, p_artwork_id, p_shares)
  ON CONFLICT (user_id, artwork_id)
  DO UPDATE SET shares = user_shares.shares + p_shares;
END;
$$;

-- Function to process artwork purchase
CREATE OR REPLACE FUNCTION process_artwork_purchase(
  p_artwork_id uuid,
  p_user_id uuid,
  p_shares integer,
  p_price_per_share numeric,
  p_payment_intent_id text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_transaction_id uuid;
BEGIN
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
    'buy',
    p_shares,
    p_price_per_share,
    p_shares * p_price_per_share,
    p_payment_intent_id,
    'completed'
  )
  RETURNING id INTO v_transaction_id;

  -- Update user shares
  PERFORM update_user_shares(p_artwork_id, p_user_id, p_shares);

  RETURN v_transaction_id;
END;
$$;

-- Function to process artwork sale
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

  RETURN v_transaction_id;
END;
$$;