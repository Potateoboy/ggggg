import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, Medal, Award, Crown } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  username: string;
  total_points: number;
  rank: number;
}

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    fetchLeaderboard();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, total_points')
        .order('total_points', { ascending: false })
        .limit(100);

      if (error) throw error;

      const leaderboardWithRanks = (data || []).map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

      setLeaderboard(leaderboardWithRanks);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <Trophy className="h-5 w-5 text-gray-400" />;
    }
  };

  const getRankStyle = (rank: number, isCurrentUser: boolean) => {
    let baseStyle = "flex items-center justify-between p-4 rounded-lg transition-colors ";
    
    if (isCurrentUser) {
      baseStyle += "bg-blue-50 border-2 border-blue-200 ";
    } else {
      baseStyle += "bg-white border border-gray-200 hover:bg-gray-50 ";
    }

    switch (rank) {
      case 1:
        return baseStyle + "shadow-lg ring-2 ring-yellow-200";
      case 2:
        return baseStyle + "shadow-md";
      case 3:
        return baseStyle + "shadow-md";
      default:
        return baseStyle;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
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
        <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
        <p className="text-gray-600 mt-2">See how you rank against other predictors</p>
      </div>

      {leaderboard.length > 0 && (
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {leaderboard.slice(0, 3).map((entry) => (
              <div
                key={entry.id}
                className={`text-center p-6 rounded-lg ${
                  entry.rank === 1
                    ? 'bg-gradient-to-b from-yellow-50 to-yellow-100 border-2 border-yellow-200'
                    : entry.rank === 2
                    ? 'bg-gradient-to-b from-gray-50 to-gray-100 border-2 border-gray-200'
                    : 'bg-gradient-to-b from-amber-50 to-amber-100 border-2 border-amber-200'
                }`}
              >
                <div className="flex justify-center mb-3">
                  {getRankIcon(entry.rank)}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {entry.username}
                </h3>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {entry.total_points}
                </p>
                <p className="text-sm text-gray-600">points</p>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    entry.rank === 1
                      ? 'bg-yellow-200 text-yellow-800'
                      : entry.rank === 2
                      ? 'bg-gray-200 text-gray-800'
                      : 'bg-amber-200 text-amber-800'
                  }`}>
                    #{entry.rank}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Full Rankings</h2>
        <div className="space-y-3">
          {leaderboard.map((entry) => {
            const isCurrentUser = entry.id === currentUserId;
            
            return (
              <div
                key={entry.id}
                className={getRankStyle(entry.rank, isCurrentUser)}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10">
                    {entry.rank <= 3 ? (
                      getRankIcon(entry.rank)
                    ) : (
                      <span className="text-lg font-bold text-gray-600">#{entry.rank}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {entry.username}
                      {isCurrentUser && (
                        <span className="ml-2 text-sm text-blue-600 font-medium">(You)</span>
                      )}
                    </h3>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900">
                    {entry.total_points}
                  </div>
                  <div className="text-sm text-gray-600">points</div>
                </div>
              </div>
            );
          })}
        </div>

        {leaderboard.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No rankings yet</h3>
            <p className="text-gray-600">Start making predictions to appear on the leaderboard!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;