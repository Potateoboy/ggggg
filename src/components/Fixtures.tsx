import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, Clock, Trophy, AlertCircle } from 'lucide-react';

interface Fixture {
  id: string;
  home_team: string;
  away_team: string;
  match_date: string;
  home_score: number | null;
  away_score: number | null;
  status: 'upcoming' | 'completed';
  gameweek: number;
}

interface Prediction {
  id: string;
  fixture_id: string;
  predicted_home_score: number;
  predicted_away_score: number;
  points_earned: number | null;
}

const Fixtures: React.FC = () => {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGameweek, setSelectedGameweek] = useState(1);

  useEffect(() => {
    fetchFixtures();
    fetchPredictions();
  }, [selectedGameweek]);

  const fetchFixtures = async () => {
    try {
      const { data, error } = await supabase
        .from('fixtures')
        .select('*')
        .eq('gameweek', selectedGameweek)
        .order('match_date');

      if (error) throw error;
      setFixtures(data || []);
    } catch (error) {
      console.error('Error fetching fixtures:', error);
    }
  };

  const fetchPredictions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setPredictions(data || []);
    } catch (error) {
      console.error('Error fetching predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const canMakePrediction = (matchDate: string) => {
    const now = new Date();
    const match = new Date(matchDate);
    const oneHourBefore = new Date(match.getTime() - 60 * 60 * 1000); // 1 hour before
    return now < oneHourBefore;
  };

  const getTimeUntilDeadline = (matchDate: string) => {
    const now = new Date();
    const match = new Date(matchDate);
    const oneHourBefore = new Date(match.getTime() - 60 * 60 * 1000);
    
    if (now >= oneHourBefore) {
      return 'Prediction deadline passed';
    }
    
    const diff = oneHourBefore.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''} until deadline`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m until deadline`;
    } else {
      return `${minutes}m until deadline`;
    }
  };

  const handlePrediction = async (fixtureId: string, homeScore: number, awayScore: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const existingPrediction = predictions.find(p => p.fixture_id === fixtureId);

      if (existingPrediction) {
        const { error } = await supabase
          .from('predictions')
          .update({
            predicted_home_score: homeScore,
            predicted_away_score: awayScore,
          })
          .eq('id', existingPrediction.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('predictions')
          .insert([
            {
              user_id: user.id,
              fixture_id: fixtureId,
              predicted_home_score: homeScore,
              predicted_away_score: awayScore,
            },
          ]);

        if (error) throw error;
      }

      fetchPredictions();
    } catch (error) {
      console.error('Error saving prediction:', error);
    }
  };

  const getPrediction = (fixtureId: string) => {
    return predictions.find(p => p.fixture_id === fixtureId);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Fixtures & Predictions</h1>
        <p className="text-gray-600 mt-2">Predict match scores to earn points (predictions close 1 hour before kickoff)</p>
      </div>

      <div className="mb-6">
        <label htmlFor="gameweek" className="block text-sm font-medium text-gray-700 mb-2">
          Select Gameweek
        </label>
        <select
          id="gameweek"
          value={selectedGameweek}
          onChange={(e) => setSelectedGameweek(Number(e.target.value))}
          className="input-field max-w-xs"
        >
          {[...Array(38)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              Gameweek {i + 1}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {fixtures.map((fixture) => {
          const prediction = getPrediction(fixture.id);
          const isCompleted = fixture.status === 'completed';
          const canPredict = canMakePrediction(fixture.match_date);
          const timeUntilDeadline = getTimeUntilDeadline(fixture.match_date);

          return (
            <div key={fixture.id} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(fixture.match_date).toLocaleDateString()}</span>
                    <Clock className="h-4 w-4 ml-2" />
                    <span>{new Date(fixture.match_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {prediction?.points_earned && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <Trophy className="h-4 w-4" />
                      <span className="text-sm font-medium">+{prediction.points_earned} points</span>
                    </div>
                  )}
                  
                  {!isCompleted && !canPredict && (
                    <div className="flex items-center space-x-1 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Predictions closed</span>
                    </div>
                  )}
                </div>
              </div>

              {!isCompleted && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <Clock className="h-4 w-4 inline mr-1" />
                    {timeUntilDeadline}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-8">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{fixture.home_team}</div>
                    <div className="text-sm text-gray-500">Home</div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {isCompleted ? (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {fixture.home_score} - {fixture.away_score}
                        </div>
                        <div className="text-sm text-gray-500">Final Score</div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={prediction?.predicted_home_score || ''}
                          onChange={(e) => {
                            if (!canPredict) return;
                            const homeScore = parseInt(e.target.value) || 0;
                            const awayScore = prediction?.predicted_away_score || 0;
                            handlePrediction(fixture.id, homeScore, awayScore);
                          }}
                          disabled={!canPredict}
                          className={`w-16 text-center input-field ${!canPredict ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                          placeholder="0"
                        />
                        <span className="text-xl font-bold text-gray-400">-</span>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={prediction?.predicted_away_score || ''}
                          onChange={(e) => {
                            if (!canPredict) return;
                            const awayScore = parseInt(e.target.value) || 0;
                            const homeScore = prediction?.predicted_home_score || 0;
                            handlePrediction(fixture.id, homeScore, awayScore);
                          }}
                          disabled={!canPredict}
                          className={`w-16 text-center input-field ${!canPredict ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                          placeholder="0"
                        />
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{fixture.away_team}</div>
                    <div className="text-sm text-gray-500">Away</div>
                  </div>
                </div>
              </div>

              {prediction && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Your prediction: {prediction.predicted_home_score} - {prediction.predicted_away_score}
                    {prediction.points_earned !== null && (
                      <span className="ml-2 text-green-600 font-medium">
                        (+{prediction.points_earned} points)
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {fixtures.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No fixtures available</h3>
          <p className="text-gray-600">Fixtures for this gameweek will be added soon.</p>
        </div>
      )}
    </div>
  );
};

export default Fixtures;