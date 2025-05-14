-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_artworks_updated_at ON artworks;
DROP TRIGGER IF EXISTS update_user_shares_updated_at ON user_shares;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop existing views if they exist
DROP VIEW IF EXISTS user_transaction_history;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS user_shares CASCADE;
DROP TABLE IF EXISTS artworks CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  name text,
  avatar_url text,
  email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create artworks table
CREATE TABLE artworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist text NOT NULL,
  description text,
  image_url text NOT NULL,
  price_per_share numeric NOT NULL,
  total_shares integer NOT NULL,
  category text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_shares table
CREATE TABLE user_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  artwork_id uuid REFERENCES artworks(id) NOT NULL,
  shares integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, artwork_id)
);

-- Create transactions table
CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  artwork_id uuid REFERENCES artworks(id) NOT NULL,
  type text NOT NULL CHECK (type IN ('buy', 'sell')),
  shares integer NOT NULL,
  price_per_share numeric NOT NULL,
  total_amount numeric NOT NULL,
  stripe_payment_id text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can create their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Artworks policies
CREATE POLICY "Anyone can view artworks"
  ON artworks FOR SELECT
  TO authenticated
  USING (true);

-- User shares policies
CREATE POLICY "Users can view their own shares"
  ON user_shares FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view their own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artworks_updated_at
  BEFORE UPDATE ON artworks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_shares_updated_at
  BEFORE UPDATE ON user_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Recreate the view
CREATE OR REPLACE VIEW user_transaction_history AS
SELECT 
  t.id,
  t.user_id,
  t.artwork_id,
  a.title as artwork_title,
  t.type,
  t.shares,
  t.price_per_share,
  t.total_amount,
  CASE 
    WHEN t.type = 'buy' THEN -t.total_amount
    WHEN t.type = 'sell' THEN t.total_amount
  END as profit_loss,
  t.status,
  t.created_at
FROM transactions t
JOIN artworks a ON t.artwork_id = a.id;