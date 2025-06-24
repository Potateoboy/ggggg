/*
  # Insert Premier League 2025/26 Season Fixtures

  1. Sample fixtures for Gameweek 1-3
    - All 20 Premier League teams
    - Realistic match dates and times
    - Proper gameweek distribution

  2. Teams included:
    - Arsenal, Aston Villa, Bournemouth, Brentford, Brighton & Hove Albion
    - Chelsea, Crystal Palace, Everton, Fulham, Ipswich Town
    - Leicester City, Liverpool, Manchester City, Manchester United
    - Newcastle United, Nottingham Forest, Southampton, Tottenham Hotspur
    - West Ham United, Wolverhampton Wanderers
*/

-- Gameweek 1 fixtures (August 16-18, 2025)
INSERT INTO fixtures (home_team, away_team, match_date, gameweek) VALUES
('Arsenal', 'Wolverhampton Wanderers', '2025-08-16 15:00:00+00', 1),
('Brighton & Hove Albion', 'Everton', '2025-08-16 15:00:00+00', 1),
('Chelsea', 'Manchester City', '2025-08-16 17:30:00+00', 1),
('Leicester City', 'Tottenham Hotspur', '2025-08-17 14:00:00+00', 1),
('Liverpool', 'Ipswich Town', '2025-08-17 14:00:00+00', 1),
('Manchester United', 'Fulham', '2025-08-17 14:00:00+00', 1),
('Newcastle United', 'Southampton', '2025-08-17 14:00:00+00', 1),
('Nottingham Forest', 'Bournemouth', '2025-08-17 16:30:00+00', 1),
('West Ham United', 'Aston Villa', '2025-08-18 14:00:00+00', 1),
('Crystal Palace', 'Brentford', '2025-08-18 16:30:00+00', 1);

-- Gameweek 2 fixtures (August 23-25, 2025)
INSERT INTO fixtures (home_team, away_team, match_date, gameweek) VALUES
('Aston Villa', 'Arsenal', '2025-08-23 15:00:00+00', 2),
('Bournemouth', 'Newcastle United', '2025-08-23 15:00:00+00', 2),
('Brentford', 'Liverpool', '2025-08-23 15:00:00+00', 2),
('Everton', 'Tottenham Hotspur', '2025-08-23 17:30:00+00', 2),
('Fulham', 'Leicester City', '2025-08-24 14:00:00+00', 2),
('Ipswich Town', 'Manchester United', '2025-08-24 14:00:00+00', 2),
('Manchester City', 'West Ham United', '2025-08-24 14:00:00+00', 2),
('Southampton', 'Nottingham Forest', '2025-08-24 16:30:00+00', 2),
('Tottenham Hotspur', 'Chelsea', '2025-08-25 14:00:00+00', 2),
('Wolverhampton Wanderers', 'Crystal Palace', '2025-08-25 16:30:00+00', 2);

-- Gameweek 3 fixtures (August 30 - September 1, 2025)
INSERT INTO fixtures (home_team, away_team, match_date, gameweek) VALUES
('Arsenal', 'Brighton & Hove Albion', '2025-08-30 15:00:00+00', 3),
('Chelsea', 'Crystal Palace', '2025-08-30 15:00:00+00', 3),
('Leicester City', 'Aston Villa', '2025-08-30 15:00:00+00', 3),
('Liverpool', 'Manchester United', '2025-08-30 17:30:00+00', 3),
('Manchester City', 'Ipswich Town', '2025-08-31 14:00:00+00', 3),
('Newcastle United', 'Tottenham Hotspur', '2025-08-31 14:00:00+00', 3),
('Nottingham Forest', 'Wolverhampton Wanderers', '2025-08-31 14:00:00+00', 3),
('Southampton', 'Brentford', '2025-08-31 16:30:00+00', 3),
('West Ham United', 'Bournemouth', '2025-09-01 14:00:00+00', 3),
('Everton', 'Fulham', '2025-09-01 16:30:00+00', 3);