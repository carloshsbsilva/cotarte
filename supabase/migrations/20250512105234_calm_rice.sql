/*
  # Update Profile Name Handling

  1. Changes
    - Add trigger to set initial name from email
    - Update profile update function to handle name changes
*/

-- Create function to extract name from email
CREATE OR REPLACE FUNCTION extract_name_from_email(email text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  -- Get everything before @ and replace dots/underscores with spaces
  RETURN regexp_replace(split_part(email, '@', 1), '[._]', ' ', 'g');
END;
$$;

-- Create trigger function to set initial name
CREATE OR REPLACE FUNCTION set_initial_profile_name()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Set first_name from email if not provided
  IF NEW.first_name IS NULL THEN
    NEW.first_name = initcap(extract_name_from_email(NEW.email));
  END IF;
  
  -- Set name for backward compatibility
  NEW.name = COALESCE(NEW.first_name, '') || CASE WHEN NEW.last_name IS NOT NULL THEN ' ' || NEW.last_name ELSE '' END;
  
  RETURN NEW;
END;
$$;

-- Create trigger to set initial name
DROP TRIGGER IF EXISTS set_profile_name ON profiles;
CREATE TRIGGER set_profile_name
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_initial_profile_name();

-- Update profile update function to handle name changes
CREATE OR REPLACE FUNCTION update_profile(
  p_user_id uuid,
  p_first_name text,
  p_last_name text,
  p_bio text DEFAULT NULL,
  p_avatar_url text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET
    first_name = p_first_name,
    last_name = p_last_name,
    name = p_first_name || CASE WHEN p_last_name IS NOT NULL THEN ' ' || p_last_name ELSE '' END,
    bio = p_bio,
    avatar_url = COALESCE(p_avatar_url, avatar_url),
    updated_at = now()
  WHERE id = p_user_id;
END;
$$;