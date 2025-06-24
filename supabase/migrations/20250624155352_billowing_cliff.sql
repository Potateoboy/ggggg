/*
  # Create table predictions table

  1. New Tables
    - `table_predictions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `team_name` (text, not null)
      - `predicted_position` (integer, not null)
      - `points_earned` (integer, nullable)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `table_predictions` table
    - Add policy for users to manage their own table predictions
    - Add unique constraint on user_id + team_name
*/

CREATE TABLE IF NOT EXISTS table_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  team_name text NOT NULL,
  predicted_position integer NOT NULL CHECK (predicted_position >= 1 AND predicted_position <= 20),
  points_earned integer,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, team_name),
  UNIQUE(user_id, predicted_position)
);

ALTER TABLE table_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own table predictions"
  ON table_predictions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);