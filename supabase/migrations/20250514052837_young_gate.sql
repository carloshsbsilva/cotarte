/*
  # Add Platform Fees System

  1. Changes
    - Add platform fees tracking
    - Add functions to handle fee calculation and collection
    - Update transaction processing to include fees
*/

-- Add fee columns to transactions
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS platform_fee numeric NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS fee_type text CHECK (fee_type IN ('ipo', 'secondary', 'none'));

-- Create function to calculate platform fee
CREATE OR REPLACE FUNCTION calculate_platform_fee(
  p_transaction_type text,
  p_amount numeric
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN CASE
    WHEN p_transaction_type = 'ipo' THEN p_amount * 0.05  -- 5% for IPO
    WHEN p_transaction_type = 'secondary' THEN p_amount * 0.025  -- 2.5% for secondary market
    ELSE 0
  END;
END;
$$;

-- Update process_artwork_purchase function to include fees
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
  v_total_amount numeric;
  v_platform_fee numeric;
  v_fee_type text;
  v_is_ipo boolean;
BEGIN
  -- Calculate total amount
  v_total_amount := p_shares * p_price_per_share;
  
  -- Determine if this is an IPO purchase
  SELECT (shares_sold = 0) INTO v_is_ipo
  FROM artworks
  WHERE id = p_artwork_id;
  
  -- Calculate platform fee
  v_fee_type := CASE WHEN v_is_ipo THEN 'ipo' ELSE 'secondary' END;
  v_platform_fee := calculate_platform_fee(v_fee_type, v_total_amount);

  -- Create transaction record
  INSERT INTO transactions (
    user_id,
    artwork_id,
    type,
    shares,
    price_per_share,
    total_amount,
    platform_fee,
    fee_type,
    stripe_payment_intent_id,
    status
  )
  VALUES (
    p_user_id,
    p_artwork_id,
    'buy',
    p_shares,
    p_price_per_share,
    v_total_amount,
    v_platform_fee,
    v_fee_type,
    p_payment_intent_id,
    'completed'
  )
  RETURNING id INTO v_transaction_id;

  -- Update user shares
  INSERT INTO user_shares (user_id, artwork_id, shares)
  VALUES (p_user_id, p_artwork_id, p_shares)
  ON CONFLICT (user_id, artwork_id)
  DO UPDATE SET shares = user_shares.shares + p_shares;

  -- Update artwork shares sold
  UPDATE artworks
  SET shares_sold = shares_sold + p_shares
  WHERE id = p_artwork_id;

  -- Recalculate market value
  PERFORM calculate_artwork_market_value(p_artwork_id);

  -- Update portfolio value
  PERFORM update_portfolio_value(p_user_id);

  RETURN v_transaction_id;
END;
$$;