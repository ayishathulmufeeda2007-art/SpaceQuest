import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

interface LeaderboardRecord {
  id: string;
  playerName: string;
  missionName: string;
  score: number;
  ratingTitle: string;
  mode: string;
  dateIso: string;
}

let leaderboardDb: LeaderboardRecord[] = [
  {
    id: 'lead-1',
    playerName: 'Cmdr. Armstrong',
    missionName: 'Lunar Explorer',
    score: 98,
    ratingTitle: 'LEGENDARY COMMANDER',
    mode: 'solo',
    dateIso: '2026-11-14'
  },
  {
    id: 'lead-2',
    playerName: 'Dr. Sally Ride',
    missionName: 'Earth Observer',
    score: 95,
    ratingTitle: 'LEGENDARY COMMANDER',
    mode: 'solo',
    dateIso: '2026-11-13'
  },
  {
    id: 'lead-3',
    playerName: 'Ares Flight Team',
    missionName: 'Mars Discovery',
    score: 88,
    ratingTitle: 'EXPERT EXPLORER',
    mode: 'team',
    dateIso: '2026-11-12'
  }
];

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Space Quest NASA Mission Control Backend', time: new Date().toISOString() });
});

// Leaderboard Endpoints
app.get('/api/leaderboard', (req, res) => {
  res.json(leaderboardDb);
});

app.post('/api/leaderboard', (req, res) => {
  const { playerName, missionName, score, ratingTitle, mode } = req.body;
  if (!missionName || score === undefined) {
    return res.status(400).json({ error: 'Missing required mission score fields' });
  }

  const newRecord: LeaderboardRecord = {
    id: `rec-${Date.now()}`,
    playerName: playerName || 'Anonymous Commander',
    missionName,
    score: Number(score),
    ratingTitle: ratingTitle || 'SKILLED ENGINEER',
    mode: mode || 'solo',
    dateIso: new Date().toISOString().split('T')[0]
  };

  leaderboardDb.push(newRecord);
  leaderboardDb.sort((a, b) => b.score - a.score);

  res.status(201).json(newRecord);
});

app.listen(PORT, () => {
  console.log(`🚀 Space Quest Mission Control API running on http://localhost:${PORT}`);
});
