-- Drop existing role check constraint if exists
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add role check constraint with NULL option
ALTER TABLE profiles
ADD CONSTRAINT profiles_role_check 
CHECK (role IS NULL OR role IN ('artist', 'investor', 'both'));

-- Create function to set initial profile data
CREATE OR REPLACE FUNCTION set_initial_profile_data()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Get email from auth.users
  NEW.email = (SELECT email FROM auth.users WHERE id = NEW.id);
  
  -- Set initial name from email (before @)
  NEW.name = initcap(split_part(NEW.email, '@', 1));
  
  -- Set role as NULL initially
  NEW.role = NULL;
  
  RETURN NEW;
END;
$$;

-- Create trigger to set initial profile data
DROP TRIGGER IF EXISTS set_profile_data ON profiles;
CREATE TRIGGER set_profile_data
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_initial_profile_data();

-- Create function to create wallet if not exists
CREATE OR REPLACE FUNCTION create_wallet_if_not_exists()
RETURNS trigger
LANGUAGE plpgsql
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