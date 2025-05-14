/*
  # Update Profile Management

  1. Changes
    - Add function to update profile role efficiently
    - Add trigger to automatically set email from auth.users
*/

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
  IF p_role NOT IN ('artist', 'investor', 'both') THEN
    RAISE EXCEPTION 'Invalid role';
  END IF;

  UPDATE profiles
  SET role = p_role,
      updated_at = now()
  WHERE id = p_user_id;
END;
$$;

-- Create trigger to set email on profile creation
CREATE OR REPLACE FUNCTION set_profile_email()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_email text;
BEGIN
  -- Get email from auth.users
  SELECT email INTO v_email
  FROM auth.users
  WHERE id = NEW.id;

  -- Set email
  NEW.email = v_email;
  
  RETURN NEW;
END;
$$;

-- Create trigger to set email
DROP TRIGGER IF EXISTS set_profile_email ON profiles;
CREATE TRIGGER set_profile_email
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_profile_email();