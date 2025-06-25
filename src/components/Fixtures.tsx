import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, Clock, Trophy, AlertCircle, ChevronDown, Target, TrendingUp } from 'lucide-react';

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

// Team logo mapping (using placeholder colors for now - in production you'd use actual logos)
const getTeamLogo = (teamName: string) => {
  const teamColors: { [key: string]: string } = {
    'Arsenal': 'bg-red-600',
    'Aston Villa': 'bg-purple-600',
    'Bournemouth': 'bg-red-500',
    'Brentford': 'bg-red-400',
    'Brighton & Hove Albion': 'bg-blue-400',
    'Burnley': 'bg-purple-800',
    'Chelsea': 'bg-blue-600',
    'Crystal Palace': 'bg-blue-500',
    'Everton': 'bg-blue-700',
    'Fulham': 'bg-black',
    'Leeds United': 'bg-white border-2 border-yellow-400',
    'Liverpool': 'bg-red-700',
    'Manchester City': 'bg-sky-500',
    'Manchester United': 'bg-red-600',
    'Newcastle United': 'bg-black',
    'Nottingham Forest': 'bg-red-800',
    'Southampton': 'bg-red-500',
    'Sunderland': 'bg-red-600',
    'Tottenham Hotspur': 'bg-white border-2 border-blue-800',
    'West Ham United': 'bg-purple-700',
    'Wolverhampton Wanderers': 'bg-orange-500',
  };
  
  return teamColors[teamName] || 'bg-gray-500';
};

const getTeamAbbreviation = (teamName: string) => {
  const abbreviations: { [key: string]: string } = {
    'Arsenal': 'ARS',
    'Aston Villa': 'AVL',
    'Bournemouth': 'BOU',
    'Brentford': 'BRE',
    'Brighton & Hove Albion': 'BHA',
    'Burnley': 'BUR',
    'Chelsea': 'CHE',
    'Crystal Palace': 'CRY',
    'Everton': 'EVE',
    'Fulham': 'FUL',
    'Leeds United': 'LEE',
    'Liverpool': 'LIV',
    'Manchester City': 'MCI',
    'Manchester United': 'MUN',
    'Newcastle United': 'NEW',
    'Nottingham Forest': 'NFO',
    'Southampton': 'SOU',
    'Sunderland': 'SUN',
    'Tottenham Hotspur': 'TOT',
    'West Ham United': 'WHU',
    'Wolverhampton Wanderers': 'WOL',
  };
  
  return abbreviations[teamName] || teamName.substring(0, 3).toUpperCase();
};

const Fixtures: React.FC = () => {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGameweek, setSelectedGameweek] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hoveredFixture, setHoveredFixture] = useState<string | null>(null);

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
    const oneHourBefore = new Date(match.getTime() - 60 * 60 * 1000);
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
    const seasonStart = new Date('2025-08-15');
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
        <h1 className="text-3xl font-bold text-gray-900">Premier League Fixtures</h1>
        <p className="text-gray-600 mt-2">Predict match scores to earn points (predictions close 1 hour before kickoff)</p>
      </div>

      {/* Enhanced Gameweek Selector */}
      <div className="mb-8">
        <div className="relative max-w-sm">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white px-6 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-between group transform hover:scale-105"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <span className="text-lg font-bold">{selectedGameweek}</span>
              </div>
              <div className="text-left">
                <div className="text-sm font-medium opacity-90">Premier League</div>
                <div className="text-xl font-bold">Gameweek {selectedGameweek}</div>
              </div>
            </div>
            <ChevronDown className={`h-6 w-6 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-96 overflow-y-auto z-50 backdrop-blur-lg">
              <div className="p-3">
                <div className="text-sm font-medium text-gray-500 px-3 py-2 border-b border-gray-100 mb-2">
                  Select Gameweek
                </div>
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
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center justify-between group hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 ${
                        selectedGameweek === gameweek ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-md' : 'text-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                          selectedGameweek === gameweek 
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                            : status === 'completed' 
                            ? 'bg-green-100 text-green-700'
                            : status === 'current'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {gameweek}
                        </div>
                        <span className="font-semibold">Gameweek {gameweek}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                          status === 'completed' 
                            ? 'bg-green-100 text-green-700'
                            : status === 'current'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {status === 'completed' ? '✓ Done' : status === 'current' ? '● Live' : '○ Soon'}
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

      <div className="space-y-6">
        {fixtures.map((fixture) => {
          const prediction = getPrediction(fixture.id);
          const isCompleted = fixture.status === 'completed';
          const canPredict = canMakePrediction(fixture.match_date);
          const timeUntilDeadline = getTimeUntilDeadline(fixture.match_date);
          const isHovered = hoveredFixture === fixture.id;

          return (
            <div 
              key={fixture.id} 
              className={`card p-6 transition-all duration-300 cursor-pointer transform ${
                isHovered ? 'shadow-2xl scale-105 bg-gradient-to-r from-blue-50 to-purple-50' : 'hover:shadow-lg'
              }`}
              onMouseEnter={() => setHoveredFixture(fixture.id)}
              onMouseLeave={() => setHoveredFixture(null)}
            >
              {/* Match Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-full">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">{new Date(fixture.match_date).toLocaleDateString('en-GB', { 
                      weekday: 'short', 
                      day: 'numeric', 
                      month: 'short' 
                    })}</span>
                    <Clock className="h-4 w-4 ml-2" />
                    <span className="font-medium">{new Date(fixture.match_date).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {prediction?.points_earned && (
                    <div className="flex items-center space-x-2 text-green-700 bg-green-100 px-4 py-2 rounded-full">
                      <Trophy className="h-4 w-4" />
                      <span className="text-sm font-bold">+{prediction.points_earned} points</span>
                    </div>
                  )}
                  
                  {!isCompleted && !canPredict && (
                    <div className="flex items-center space-x-2 text-red-700 bg-red-100 px-4 py-2 rounded-full">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Predictions closed</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Prediction Deadline */}
              {!isCompleted && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200 rounded-xl">
                  <p className="text-sm text-blue-800 flex items-center font-medium">
                    <Clock className="h-4 w-4 inline mr-2" />
                    {timeUntilDeadline}
                  </p>
                </div>
              )}

              {/* Teams and Prediction Interface */}
              <div className="flex items-center justify-center space-x-8">
                {/* Home Team */}
                <div className="flex-1 text-center">
                  <div className="flex flex-col items-center space-y-3">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg ${getTeamLogo(fixture.home_team)}`}>
                      {getTeamAbbreviation(fixture.home_team)}
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">{fixture.home_team}</div>
                      <div className="text-sm text-gray-500 font-medium">Home</div>
                    </div>
                  </div>
                </div>

                {/* Score/Prediction Area */}
                <div className="flex flex-col items-center space-y-4">
                  {isCompleted ? (
                    <div className="text-center bg-gray-100 px-8 py-4 rounded-2xl shadow-inner">
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {fixture.home_score} - {fixture.away_score}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">Final Score</div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-3">
                      <div className="flex items-center space-x-3">
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
                          className={`w-20 h-12 text-center text-xl font-bold rounded-xl border-2 transition-all duration-200 ${
                            !canPredict 
                              ? 'bg-gray-100 cursor-not-allowed border-gray-200' 
                              : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300 hover:border-blue-400'
                          }`}
                          placeholder="0"
                        />
                        <span className="text-2xl font-bold text-gray-400">-</span>
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
                          className={`w-20 h-12 text-center text-xl font-bold rounded-xl border-2 transition-all duration-200 ${
                            !canPredict 
                              ? 'bg-gray-100 cursor-not-allowed border-gray-200' 
                              : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300 hover:border-blue-400'
                          }`}
                          placeholder="0"
                        />
                      </div>
                      
                      {canPredict && isHovered && (
                        <div className="flex items-center space-x-2 text-blue-600 animate-pulse">
                          <Target className="h-4 w-4" />
                          <span className="text-sm font-medium">Click to predict!</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Away Team */}
                <div className="flex-1 text-center">
                  <div className="flex flex-col items-center space-y-3">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg ${getTeamLogo(fixture.away_team)}`}>
                      {getTeamAbbreviation(fixture.away_team)}
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">{fixture.away_team}</div>
                      <div className="text-sm text-gray-500 font-medium">Away</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Prediction Summary */}
              {prediction && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-3 rounded-xl">
                    <div className="text-sm text-gray-700">
                      <span className="font-semibold">Your prediction:</span> {prediction.predicted_home_score} - {prediction.predicted_away_score}
                    </div>
                    {prediction.points_earned !== null && (
                      <div className="flex items-center space-x-1 text-green-700">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm font-bold">+{prediction.points_earned} points earned!</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Hover Effect - Prediction Options */}
              {isHovered && canPredict && !prediction && (
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
                  <div className="text-center">
                    <p className="text-blue-800 font-medium mb-2">💡 Prediction Tips</p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-white px-2 py-1 rounded">Exact Score: 500pts</div>
                      <div className="bg-white px-2 py-1 rounded">Correct Result: 100pts</div>
                      <div className="bg-white px-2 py-1 rounded">Goal Difference: 50pts</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {fixtures.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No fixtures available</h3>
          <p className="text-gray-600">Fixtures for Gameweek {selectedGameweek} will be added soon.</p>
        </div>
      )}
    </div>
  );
};

export default Fixtures;