/*
  # Create function to update user points

  1. Function to calculate and update points
    - Updates predictions table with points earned
    - Updates profiles table with total points
    - Called when fixture results are added

  2. Scoring system:
    - Correct exact score: 500 points
    - Table predictions: 100 points per correct position
*/

CREATE OR REPLACE FUNCTION update_prediction_points()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process when fixture is completed and has scores
  IF NEW.status = 'completed' AND NEW.home_score IS NOT NULL AND NEW.away_score IS NOT NULL THEN
    -- Update points for exact score predictions
    UPDATE predictions 
    SET points_earned = CASE 
      WHEN predicted_home_score = NEW.home_score AND predicted_away_score = NEW.away_score 
      THEN 500 
      ELSE 0 
    END
    WHERE fixture_id = NEW.id AND points_earned IS NULL;
    
    -- Update total points in profiles
    UPDATE profiles 
    SET total_points = (
      SELECT COALESCE(SUM(points_earned), 0) 
      FROM predictions 
      WHERE user_id = profiles.id AND points_earned IS NOT NULL
    ) + (
      SELECT COALESCE(SUM(points_earned), 0) 
      FROM table_predictions 
      WHERE user_id = profiles.id AND points_earned IS NOT NULL
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update points when fixtures are completed
DROP TRIGGER IF EXISTS update_points_trigger ON fixtures;
CREATE TRIGGER update_points_trigger
  AFTER UPDATE ON fixtures
  FOR EACH ROW
  EXECUTE FUNCTION update_prediction_points();