/*
  # Initial Schema Setup

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, matches auth.users.id)
      - `name` (text)
      - `avatar_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `artworks`
      - `id` (uuid, primary key)
      - `title` (text)
      - `artist` (text)
      - `description` (text)
      - `image_url` (text)
      - `price_per_share` (numeric)
      - `total_shares` (integer)
      - `category` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `user_shares`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles.id)
      - `artwork_id` (uuid, references artworks.id)
      - `shares` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles.id)
      - `artwork_id` (uuid, references artworks.id)
      - `type` (text, 'buy' or 'sell')
      - `shares` (integer)
      - `price_per_share` (numeric)
      - `total_amount` (numeric)
      - `stripe_payment_id` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create artworks table
CREATE TABLE IF NOT EXISTS artworks (
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
CREATE TABLE IF NOT EXISTS user_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  artwork_id uuid REFERENCES artworks(id) NOT NULL,
  shares integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, artwork_id)
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  artwork_id uuid REFERENCES artworks(id) NOT NULL,
  type text NOT NULL CHECK (type IN ('buy', 'sell')),
  shares integer NOT NULL,
  price_per_share numeric NOT NULL,
  total_amount numeric NOT NULL,
  stripe_payment_id text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

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

-- Create trigger to update updated_at
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