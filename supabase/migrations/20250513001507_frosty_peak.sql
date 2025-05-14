/*
  # Add Notifications System

  1. New Tables
    - `notifications`
      - Tracks user notifications
      - Stores notification messages and read status
    - Add trigger for IPO approval notifications

  2. Security
    - Enable RLS on notifications table
    - Add policies for notification access
*/

-- Create notifications table
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policy for updating notifications
CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to notify when IPO is approved
CREATE OR REPLACE FUNCTION notify_ipo_approved()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status <> 'approved' THEN
    INSERT INTO notifications (user_id, message)
    VALUES (
      NEW.user_id,
      'Sua obra "' || NEW.title || '" foi aprovada e já está disponível no mercado!'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for IPO approval
CREATE TRIGGER on_ipo_approved
  AFTER UPDATE ON ipos
  FOR EACH ROW
  EXECUTE FUNCTION notify_ipo_approved();