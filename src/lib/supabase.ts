import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          total_points: number;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          total_points?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          total_points?: number;
          created_at?: string;
        };
      };
      fixtures: {
        Row: {
          id: string;
          home_team: string;
          away_team: string;
          match_date: string;
          home_score: number | null;
          away_score: number | null;
          status: 'upcoming' | 'completed';
          gameweek: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          home_team: string;
          away_team: string;
          match_date: string;
          home_score?: number | null;
          away_score?: number | null;
          status?: 'upcoming' | 'completed';
          gameweek: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          home_team?: string;
          away_team?: string;
          match_date?: string;
          home_score?: number | null;
          away_score?: number | null;
          status?: 'upcoming' | 'completed';
          gameweek?: number;
          created_at?: string;
        };
      };
      predictions: {
        Row: {
          id: string;
          user_id: string;
          fixture_id: string;
          predicted_home_score: number;
          predicted_away_score: number;
          points_earned: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          fixture_id: string;
          predicted_home_score: number;
          predicted_away_score: number;
          points_earned?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          fixture_id?: string;
          predicted_home_score?: number;
          predicted_away_score?: number;
          points_earned?: number | null;
          created_at?: string;
        };
      };
      table_predictions: {
        Row: {
          id: string;
          user_id: string;
          team_name: string;
          predicted_position: number;
          points_earned: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          team_name: string;
          predicted_position: number;
          points_earned?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          team_name?: string;
          predicted_position?: number;
          points_earned?: number | null;
          created_at?: string;
        };
      };
    };
  };
};