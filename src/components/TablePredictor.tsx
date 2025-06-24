import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Table, Trophy, Save } from 'lucide-react';

const PREMIER_LEAGUE_TEAMS = [
  'Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton & Hove Albion',
  'Chelsea', 'Crystal Palace', 'Everton', 'Fulham', 'Ipswich Town',
  'Leicester City', 'Liverpool', 'Manchester City', 'Manchester United',
  'Newcastle United', 'Nottingham Forest', 'Southampton', 'Tottenham Hotspur',
  'West Ham United', 'Wolverhampton Wanderers'
];

interface TablePrediction {
  id: string;
  team_name: string;
  predicted_position: number;
  points_earned: number | null;
}

const TablePredictor: React.FC = () => {
  const [predictions, setPredictions] = useState<TablePrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [canEdit, setCanEdit] = useState(true);

  useEffect(() => {
    fetchTablePredictions();
    checkEditDeadline();
  }, []);

  const checkEditDeadline = () => {
    const deadline = new Date('2025-08-14T00:00:00Z');
    const now = new Date();
    setCanEdit(now < deadline);
  };

  const fetchTablePredictions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('table_predictions')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data && data.length > 0) {
        setPredictions(data);
      } else {
        // Initialize with default positions
        const defaultPredictions = PREMIER_LEAGUE_TEAMS.map((team, index) => ({
          id: '',
          team_name: team,
          predicted_position: index + 1,
          points_earned: null,
        }));
        setPredictions(defaultPredictions);
      }
    } catch (error) {
      console.error('Error fetching table predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePositionChange = (teamName: string, newPosition: number) => {
    if (!canEdit) return;

    setPredictions(prev => {
      const updated = [...prev];
      const teamIndex = updated.findIndex(p => p.team_name === teamName);
      const oldPosition = updated[teamIndex].predicted_position;

      // Update the team's position
      updated[teamIndex].predicted_position = newPosition;

      // Adjust other teams' positions
      updated.forEach((prediction, index) => {
        if (index !== teamIndex) {
          if (newPosition <= oldPosition) {
            // Moving up - push others down
            if (prediction.predicted_position >= newPosition && prediction.predicted_position < oldPosition) {
              prediction.predicted_position += 1;
            }
          } else {
            // Moving down - pull others up
            if (prediction.predicted_position > oldPosition && prediction.predicted_position <= newPosition) {
              prediction.predicted_position -= 1;
            }
          }
        }
      });

      return updated.sort((a, b) => a.predicted_position - b.predicted_position);
    });
  };

  const savePredictions = async () => {
    if (!canEdit) return;

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Delete existing predictions
      await supabase
        .from('table_predictions')
        .delete()
        .eq('user_id', user.id);

      // Insert new predictions
      const { error } = await supabase
        .from('table_predictions')
        .insert(
          predictions.map(p => ({
            user_id: user.id,
            team_name: p.team_name,
            predicted_position: p.predicted_position,
          }))
        );

      if (error) throw error;

      alert('Table predictions saved successfully!');
    } catch (error) {
      console.error('Error saving predictions:', error);
      alert('Error saving predictions. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="space-y-4">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Table Predictor</h1>
        <p className="text-gray-600 mt-2">
          Predict the final Premier League table positions. Each correct position earns 100 points.
        </p>
        {!canEdit && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              The deadline for table predictions has passed (August 14, 2025). You can no longer edit your predictions.
            </p>
          </div>
        )}
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Table className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Premier League 2025/26 Final Table</h2>
          </div>
          {canEdit && (
            <button
              onClick={savePredictions}
              disabled={saving}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving...' : 'Save Predictions'}</span>
            </button>
          )}
        </div>

        <div className="space-y-2">
          {predictions.map((prediction, index) => (
            <div
              key={prediction.team_name}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                  <span className="text-sm font-bold text-blue-600">{prediction.predicted_position}</span>
                </div>
                <div className="text-lg font-medium text-gray-900">{prediction.team_name}</div>
                {prediction.points_earned !== null && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <Trophy className="h-4 w-4" />
                    <span className="text-sm font-medium">+{prediction.points_earned} points</span>
                  </div>
                )}
              </div>

              {canEdit && (
                <select
                  value={prediction.predicted_position}
                  onChange={(e) => handlePositionChange(prediction.team_name, parseInt(e.target.value))}
                  className="input-field w-20 text-center"
                >
                  {[...Array(20)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Scoring System</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Each correct position prediction: 100 points</li>
            <li>• Predictions must be submitted before August 14, 2025</li>
            <li>• Points are awarded at the end of the season</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TablePredictor;