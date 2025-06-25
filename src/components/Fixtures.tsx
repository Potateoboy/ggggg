import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, Clock, Trophy, AlertCircle, ChevronDown } from 'lucide-react';

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
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  const getGameweekStatus = (gameweek: number) => {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    
    // Rough estimation based on season start
    const seasonStart = new Date('2025-08-16');
    const weeksSinceStart = Math.floor((now.getTime() - seasonStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    if (gameweek < weeksSinceStart) return 'completed';
    if (gameweek === weeksSinceStart) return 'current';
    return 'upcoming';
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

      {/* Sleeker Gameweek Selector */}
      <div className="mb-8">
        <div className="relative max-w-xs">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold">{selectedGameweek}</span>
              </div>
              <div>
                <div className="text-left">
                  <div className="text-sm font-medium opacity-90">Gameweek</div>
                  <div className="text-lg font-bold">Week {selectedGameweek}</div>
                </div>
              </div>
            </div>
            <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-80 overflow-y-auto z-50">
              <div className="p-2">
                {[...Array(38)].map((_, i) => {
                  const gameweek = i + 1;
                  const status = getGameweekStatus(gameweek);
                  
                  return (
                    <button
                      key={gameweek}
                      onClick={() => {
                        setSelectedGameweek(gameweek);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between group hover:bg-gray-50 ${
                        selectedGameweek === gameweek ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          selectedGameweek === gameweek 
                            ? 'bg-blue-600 text-white' 
                            : status === 'completed' 
                            ? 'bg-green-100 text-green-600'
                            : status === 'current'
                            ? 'bg-orange-100 text-orange-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {gameweek}
                        </div>
                        <span className="font-medium">Gameweek {gameweek}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          status === 'completed' 
                            ? 'bg-green-100 text-green-600'
                            : status === 'current'
                            ? 'bg-orange-100 text-orange-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {status === 'completed' ? 'Done' : status === 'current' ? 'Live' : 'Soon'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {fixtures.map((fixture) => {
          const prediction = getPrediction(fixture.id);
          const isCompleted = fixture.status === 'completed';
          const canPredict = canMakePrediction(fixture.match_date);
          const timeUntilDeadline = getTimeUntilDeadline(fixture.match_date);

          return (
            <div key={fixture.id} className="card p-6 hover:shadow-lg transition-shadow duration-200">
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
                    <div className="flex items-center space-x-1 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      <Trophy className="h-4 w-4" />
                      <span className="text-sm font-medium">+{prediction.points_earned} points</span>
                    </div>
                  )}
                  
                  {!isCompleted && !canPredict && (
                    <div className="flex items-center space-x-1 text-red-600 bg-red-50 px-3 py-1 rounded-full">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Predictions closed</span>
                    </div>
                  )}
                </div>
              </div>

              {!isCompleted && (
                <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 flex items-center">
                    <Clock className="h-4 w-4 inline mr-2" />
                    {timeUntilDeadline}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-8">
                  <div className="text-center min-w-[120px]">
                    <div className="text-lg font-semibold text-gray-900 mb-1">{fixture.home_team}</div>
                    <div className="text-sm text-gray-500">Home</div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {isCompleted ? (
                      <div className="text-center bg-gray-50 px-6 py-3 rounded-lg">
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
                          className={`w-16 text-center input-field ${!canPredict ? 'bg-gray-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-blue-500'}`}
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
                          className={`w-16 text-center input-field ${!canPredict ? 'bg-gray-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-blue-500'}`}
                          placeholder="0"
                        />
                      </div>
                    )}
                  </div>

                  <div className="text-center min-w-[120px]">
                    <div className="text-lg font-semibold text-gray-900 mb-1">{fixture.away_team}</div>
                    <div className="text-sm text-gray-500">Away</div>
                  </div>
                </div>
              </div>

              {prediction && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
                    <span className="font-medium">Your prediction:</span> {prediction.predicted_home_score} - {prediction.predicted_away_score}
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