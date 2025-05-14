/*
  # Remove IPO Approval Notifications

  1. Changes
    - Drop trigger for IPO approval notifications
    - Drop notification function
*/

-- Drop the trigger first
DROP TRIGGER IF EXISTS on_ipo_approved ON ipos;

-- Then drop the function
DROP FUNCTION IF EXISTS notify_ipo_approved();