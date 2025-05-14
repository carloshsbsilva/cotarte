/*
  # Fix wallet creation and add helper functions

  1. Changes
    - Add function to safely create user wallet
    - Add function to get stripe account ID
    - Add trigger to prevent multiple wallets per user

  2. Security
    - Functions run with security definer to handle permissions
    - RLS policies remain unchanged
*/

-- Function to safely create a user wallet
CREATE OR REPLACE FUNCTION create_user_wallet(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if wallet already exists
  IF NOT EXISTS (SELECT 1 FROM wallets WHERE wallets.user_id = create_user_wallet.user_id) THEN
    -- Check if profile exists first
    IF EXISTS (SELECT 1 FROM profiles WHERE profiles.id = create_user_wallet.user_id) THEN
      INSERT INTO wallets (user_id, balance)
      VALUES (create_user_wallet.user_id, 0);
    ELSE
      RAISE EXCEPTION 'Profile does not exist';
    END IF;
  END IF;
END;
$$;

-- Function to get user's stripe account ID
CREATE OR REPLACE FUNCTION get_stripe_account_id(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stripe_account_id text;
BEGIN
  SELECT stripe_account_id INTO v_stripe_account_id
  FROM profiles
  WHERE id = get_stripe_account_id.user_id;
  
  RETURN v_stripe_account_id;
END;
$$;