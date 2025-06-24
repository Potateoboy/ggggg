/*
  # Create fixtures table

  1. New Tables
    - `fixtures`
      - `id` (uuid, primary key)
      - `home_team` (text, not null)
      - `away_team` (text, not null)
      - `match_date` (timestamp, not null)
      - `home_score` (integer, nullable)
      - `away_score` (integer, nullable)
      - `status` (text, default 'upcoming')
      - `gameweek` (integer, not null)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `fixtures` table
    - Add policy for public read access to all fixtures
*/

CREATE TABLE IF NOT EXISTS fixtures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  home_team text NOT NULL,
  away_team text NOT NULL,
  match_date timestamptz NOT NULL,
  home_score integer,
  away_score integer,
  status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed')),
  gameweek integer NOT NULL CHECK (gameweek >= 1 AND gameweek <= 38),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE fixtures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to fixtures"
  ON fixtures
  FOR SELECT
  TO authenticated
  USING (true);