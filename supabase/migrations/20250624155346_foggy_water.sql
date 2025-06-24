/*
  # Create predictions table

  1. New Tables
    - `predictions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `fixture_id` (uuid, references fixtures)
      - `predicted_home_score` (integer, not null)
      - `predicted_away_score` (integer, not null)
      - `points_earned` (integer, nullable)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `predictions` table
    - Add policy for users to manage their own predictions
    - Add unique constraint on user_id + fixture_id
*/

CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  fixture_id uuid NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
  predicted_home_score integer NOT NULL CHECK (predicted_home_score >= 0),
  predicted_away_score integer NOT NULL CHECK (predicted_away_score >= 0),
  points_earned integer,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, fixture_id)
);

ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own predictions"
  ON predictions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);