/*
  # Fix Profile Role Selection

  1. Changes
    - Add function to update profile role
    - Add trigger to create wallet on profile creation
    - Update profile role constraints
*/

-- Update role check constraint
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_role_check,
ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('artist', 'investor', 'both'));

-- Create function to update profile role
CREATE OR REPLACE FUNCTION update_profile_role(
  p_user_id uuid,
  p_role text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate role
  IF p_role NOT IN ('artist', 'investor', 'both') THEN
    RAISE EXCEPTION 'Invalid role';
  END IF;

  -- Update profile role
  UPDATE profiles
  SET 
    role = p_role,
    updated_at = now()
  WHERE id = p_user_id;

  -- Create wallet if it doesn't exist
  INSERT INTO wallets (user_id, balance)
  VALUES (p_user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;