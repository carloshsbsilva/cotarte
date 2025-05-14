/*
  # Create wallet function and trigger

  1. New Functions
    - `create_user_wallet`: Creates a wallet for a user if one doesn't exist
    - `create_wallet_if_not_exists`: Trigger function to automatically create wallets

  2. New Triggers
    - `create_wallet_on_profile_insert`: Creates wallet when a new profile is created

  3. Security
    - Function is accessible to authenticated users
*/

-- Create function to create a wallet if it doesn't exist
CREATE OR REPLACE FUNCTION public.create_user_wallet(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO wallets (user_id, balance)
  VALUES (user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;

-- Create trigger function to automatically create wallets
CREATE OR REPLACE FUNCTION public.create_wallet_if_not_exists()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO wallets (user_id, balance)
  VALUES (NEW.id, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger to create wallet on profile insert
DROP TRIGGER IF EXISTS create_wallet_on_profile_insert ON profiles;
CREATE TRIGGER create_wallet_on_profile_insert
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_wallet_if_not_exists();