/*
  # Add heartbeat function for connection checks

  1. New Functions
    - `heartbeat()`: A simple function that returns true, used for connection health checks

  2. Security
    - Function is accessible to all users (including anonymous)
    - No sensitive data is exposed
*/

CREATE OR REPLACE FUNCTION public.heartbeat()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT true;
$$;

-- Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION public.heartbeat() TO anon;
GRANT EXECUTE ON FUNCTION public.heartbeat() TO authenticated;
GRANT EXECUTE ON FUNCTION public.heartbeat() TO service_role;