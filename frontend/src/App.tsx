import React, { useState, useEffect } from 'react';
import { GameMode, MissionDefinition, LeaderboardEntry } from './types';
import { MISSIONS } from './data/missions';
import { HomeScreen } from './components/home/HomeScreen';
import { MissionSelectionView } from './components/missions/MissionSelectionView';
import { MissionLifecycleHub } from './components/planning/MissionLifecycleHub';
import { HowToPlayModal } from './components/modals/HowToPlayModal';
import { LeaderboardModal } from './components/modals/LeaderboardModal';
import { SettingsModal } from './components/modals/SettingsModal';

const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
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
  },
  {
    id: 'lead-4',
    playerName: 'Voyager Pioneer',
    missionName: 'Deep Space Explorer',
    score: 79,
    ratingTitle: 'EXPERT EXPLORER',
    mode: 'sandbox',
    dateIso: '2026-11-11'
  }
];

export function App() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'missions' | 'lifecycle'>('home');
  const [gameMode, setGameMode] = useState<GameMode>('solo');
  const [selectedMission, setSelectedMission] = useState<MissionDefinition>(MISSIONS[0]);

  // Modal Dialogs
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Local and Remote Leaderboard Sync
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    try {
      const saved = localStorage.getItem('spacequest_leaderboard');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_LEADERBOARD;
  });

  // Fetch backend records on mount
  useEffect(() => {
    fetch('http://localhost:3001/api/leaderboard')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Backend offline');
      })
      .then((records: LeaderboardEntry[]) => {
        if (records && records.length > 0) {
          setLeaderboard(prev => {
            const map = new Map<string, LeaderboardEntry>();
            // Add server records
            records.forEach(r => map.set(r.id, r));
            // Add local records
            prev.forEach(p => {
              if (!map.has(p.id)) map.set(p.id, p);
            });
            return Array.from(map.values()).sort((a, b) => b.score - a.score);
          });
        }
      })
      .catch(() => {
        // Backend offline or running standalone - local storage is primary
      });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('spacequest_leaderboard', JSON.stringify(leaderboard));
    } catch {
      // ignore
    }
  }, [leaderboard]);

  const handleStartGame = (mode: GameMode) => {
    setGameMode(mode);
    setCurrentScreen('missions');
  };

  const handleSelectMission = (mission: MissionDefinition) => {
    setSelectedMission(mission);
    setCurrentScreen('lifecycle');
  };

  const handleSaveToLeaderboard = (score: number, ratingTitle: string, customPlayerName?: string) => {
    const finalName = customPlayerName && customPlayerName.trim().length > 0
      ? customPlayerName.trim()
      : (gameMode === 'team' ? 'Mission Team Alpha' : 'Commander Pilot');

    const newEntry: LeaderboardEntry = {
      id: `score-${Date.now()}`,
      playerName: finalName,
      missionName: selectedMission.name,
      score,
      ratingTitle,
      mode: gameMode,
      dateIso: new Date().toISOString().split('T')[0],
      isNew: true
    };

    // Update local state and unmark prior "isNew"
    setLeaderboard(prev => [newEntry, ...prev.map(item => ({ ...item, isNew: false }))].sort((a, b) => b.score - a.score));

    // Also sync to backend API
    fetch('http://localhost:3001/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerName: newEntry.playerName,
        missionName: newEntry.missionName,
        score: newEntry.score,
        ratingTitle: newEntry.ratingTitle,
        mode: newEntry.mode
      })
    }).catch(() => {
      // Ignore network errors - locally persisted
    });
  };

  const handleClearLeaderboard = () => {
    setLeaderboard([]);
    try {
      localStorage.removeItem('spacequest_leaderboard');
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Screen Router */}
      {currentScreen === 'home' && (
        <HomeScreen
          onStartGame={handleStartGame}
          onOpenHowToPlay={() => setShowHowToPlay(true)}
          onOpenMissions={() => setCurrentScreen('missions')}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}

      {currentScreen === 'missions' && (
        <div className="p-4 md:p-8">
          <MissionSelectionView
            gameMode={gameMode}
            onSelectMission={handleSelectMission}
            onBackToHome={() => setCurrentScreen('home')}
          />
        </div>
      )}

      {currentScreen === 'lifecycle' && (
        <MissionLifecycleHub
          mission={selectedMission}
          gameMode={gameMode}
          onExitToMissions={() => setCurrentScreen('missions')}
          onSaveToLeaderboard={handleSaveToLeaderboard}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
        />
      )}

      {/* Global Modals */}
      {showHowToPlay && (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}

      {showLeaderboard && (
        <LeaderboardModal
          entries={leaderboard}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onClearLeaderboard={handleClearLeaderboard}
        />
      )}
    </div>
  );
}

export default App;
