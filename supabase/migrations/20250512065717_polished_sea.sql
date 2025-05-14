/*
  # Add wallet creation policy

  1. Security Changes
    - Add INSERT policy to wallets table allowing users to create their own wallet
    - This fixes the RLS violation error when creating new wallets

  2. Existing Policies
    - Current SELECT policy remains unchanged: "Users can view their own wallet"
*/

-- Add policy to allow users to create their own wallet
CREATE POLICY "Users can create their own wallet"
ON wallets
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);