/*
  # Physical Sales Implementation

  1. New Tables
    - physical_sales: Tracks proposals to sell physical artworks
    - physical_sale_votes: Records shareholder votes on sale proposals

  2. Security
    - Enable RLS on both tables
    - Add policies for viewing sales and voting

  3. Functions
    - propose_physical_sale: Creates new sale proposals
    - vote_on_physical_sale: Records shareholder votes
    - complete_physical_sale: Distributes funds when sale completes
*/

-- Create physical_sales table
CREATE TABLE IF NOT EXISTS physical_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id uuid REFERENCES artworks(id) NOT NULL,
  proposed_price numeric NOT NULL,
  buyer_name text NOT NULL,
  buyer_email text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  votes_yes integer NOT NULL DEFAULT 0,
  votes_no integer NOT NULL DEFAULT 0,
  total_eligible_shares integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  completed_at timestamptz
);

-- Create partial index for pending sales
CREATE UNIQUE INDEX physical_sales_pending_artwork_idx ON physical_sales (artwork_id) 
WHERE status = 'pending';

-- Create physical_sale_votes table
CREATE TABLE IF NOT EXISTS physical_sale_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid REFERENCES physical_sales(id) NOT NULL,
  user_id uuid REFERENCES profiles(id) NOT NULL,
  shares integer NOT NULL,
  vote boolean NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(sale_id, user_id)
);

-- Enable RLS
ALTER TABLE physical_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE physical_sale_votes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view physical sales"
  ON physical_sales FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can vote on physical sales"
  ON physical_sale_votes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_shares
      WHERE user_id = auth.uid()
      AND artwork_id = (
        SELECT artwork_id FROM physical_sales WHERE id = physical_sale_votes.sale_id
      )
      AND shares > 0
    )
  );

-- Create function to propose physical sale
CREATE OR REPLACE FUNCTION propose_physical_sale(
  p_artwork_id uuid,
  p_proposed_price numeric,
  p_buyer_name text,
  p_buyer_email text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sale_id uuid;
  v_total_shares integer;
BEGIN
  -- Get total shares
  SELECT total_shares INTO v_total_shares
  FROM artworks
  WHERE id = p_artwork_id;

  -- Create sale proposal
  INSERT INTO physical_sales (
    artwork_id,
    proposed_price,
    buyer_name,
    buyer_email,
    total_eligible_shares,
    expires_at
  )
  VALUES (
    p_artwork_id,
    p_proposed_price,
    p_buyer_name,
    p_buyer_email,
    v_total_shares,
    now() + interval '7 days'
  )
  RETURNING id INTO v_sale_id;

  RETURN v_sale_id;
END;
$$;

-- Create function to vote on physical sale
CREATE OR REPLACE FUNCTION vote_on_physical_sale(
  p_sale_id uuid,
  p_user_id uuid,
  p_vote boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_shares integer;
  v_sale_status text;
  v_artwork_id uuid;
BEGIN
  -- Get sale status and artwork
  SELECT status, artwork_id INTO v_sale_status, v_artwork_id
  FROM physical_sales
  WHERE id = p_sale_id;

  -- Check if sale is still pending
  IF v_sale_status != 'pending' THEN
    RAISE EXCEPTION 'Sale is no longer pending';
  END IF;

  -- Get user's shares
  SELECT shares INTO v_shares
  FROM user_shares
  WHERE user_id = p_user_id
  AND artwork_id = v_artwork_id;

  -- Record vote
  INSERT INTO physical_sale_votes (sale_id, user_id, shares, vote)
  VALUES (p_sale_id, p_user_id, v_shares, p_vote)
  ON CONFLICT (sale_id, user_id)
  DO UPDATE SET vote = p_vote;

  -- Update vote counts
  UPDATE physical_sales
  SET
    votes_yes = (
      SELECT COALESCE(SUM(shares), 0)
      FROM physical_sale_votes
      WHERE sale_id = p_sale_id AND vote = true
    ),
    votes_no = (
      SELECT COALESCE(SUM(shares), 0)
      FROM physical_sale_votes
      WHERE sale_id = p_sale_id AND vote = false
    )
  WHERE id = p_sale_id;
END;
$$;

-- Create function to complete physical sale
CREATE OR REPLACE FUNCTION complete_physical_sale(
  p_sale_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_artwork_id uuid;
  v_proposed_price numeric;
  v_total_shares integer;
  r_shareholder RECORD;
BEGIN
  -- Get sale details
  SELECT 
    artwork_id,
    proposed_price,
    total_eligible_shares
  INTO
    v_artwork_id,
    v_proposed_price,
    v_total_shares
  FROM physical_sales
  WHERE id = p_sale_id;

  -- Distribute funds to shareholders
  FOR r_shareholder IN (
    SELECT 
      user_id,
      shares,
      (shares::numeric / v_total_shares::numeric * v_proposed_price) as payout
    FROM user_shares
    WHERE artwork_id = v_artwork_id
  ) LOOP
    -- Add payout to user's wallet
    UPDATE wallets
    SET balance = balance + r_shareholder.payout
    WHERE user_id = r_shareholder.user_id;

    -- Record transaction
    INSERT INTO transactions (
      user_id,
      artwork_id,
      type,
      amount,
      status
    ) VALUES (
      r_shareholder.user_id,
      v_artwork_id,
      'physical_sale_payout',
      r_shareholder.payout,
      'completed'
    );
  END LOOP;

  -- Mark sale as completed
  UPDATE physical_sales
  SET 
    status = 'completed',
    completed_at = now()
  WHERE id = p_sale_id;

  -- Mark artwork as sold
  UPDATE artworks
  SET status = 'sold'
  WHERE id = v_artwork_id;
END;
$$;