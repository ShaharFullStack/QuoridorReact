import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, GameSettings, Mission } from '../../../Types';
import './Dashboard.css';

// Mock data - will be replaced with real API calls
const mockUser: User = {
    id: '1',
    username: 'Player1',
    email: 'player@example.com',
    displayName: 'Player One',
    level: 15,
    experience: 2450,
    coins: 1250,
    diamonds: 25,
    createdAt: new Date(),
    lastLogin: new Date(),
    preferences: {
        language: 'en',
        soundEnabled: true,
        musicEnabled: true,
        graphicsQuality: 'high',
        cameraSpeed: 1.0,
        showAnimations: true,
        selectedSkins: {
            boardTexture: 'stone-tile',
            wallTexture: 'black-white-tile',
            goalTexture: 'dark-tiles',
            playerSkin: 'default'
        }
    },
    statistics: {
        gamesPlayed: 87,
        gamesWon: 52,
        gamesLost: 35,
        winRate: 59.8,
        averageGameTime: 423,
        bestTime: 187,
        totalPlayTime: 36801,
        favoriteGameMode: 'pvc',
        highestLevelReached: 15,
        perfectGames: 8,
        longestWinStreak: 7,
        currentWinStreak: 3
    }
};

const mockMissions: Mission[] = [
    {
        id: '1',
        title: 'Daily Victory',
        description: 'Win 3 games today',
        type: 'daily',
        requirements: [{
            type: 'win_games',
            target: 3,
            current: 1
        }],
        rewards: [{
            id: '1',
            type: 'coins',
            amount: 100,
            reason: 'Daily mission completion',
            category: 'mission'
        }],
        progress: 33,
        maxProgress: 100,
        isCompleted: false,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    },
    {
        id: '2',
        title: 'Perfect Player',
        description: 'Win a game without losing any walls',
        type: 'weekly',
        requirements: [{
            type: 'perfect_game',
            target: 1,
            current: 0
        }],
        rewards: [{
            id: '2',
            type: 'diamonds',
            amount: 5,
            reason: 'Perfect game achievement',
            category: 'mission'
        }],
        progress: 0,
        maxProgress: 100,
        isCompleted: false,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
];

export function Dashboard(): JSX.Element {
    const [user] = useState<User>(mockUser);
    const [missions] = useState<Mission[]>(mockMissions);
    const [selectedGameMode, setSelectedGameMode] = useState<'quick' | 'ranked' | 'custom'>('quick');
    const [selectedBoardSize, setSelectedBoardSize] = useState<number>(9);
    const navigate = useNavigate();

    const handleStartGame = () => {
        const gameSettings: GameSettings = {
            boardSize: selectedBoardSize,
            aiLevel: 'medium',
            soundEnabled: user.preferences.soundEnabled,
            musicEnabled: user.preferences.musicEnabled,
            showAnimations: user.preferences.showAnimations,
            cameraSpeed: user.preferences.cameraSpeed,
            graphicsQuality: user.preferences.graphicsQuality
        };

        // Navigate to game with settings
        navigate('/game', { state: { gameSettings, gameMode: selectedGameMode } });
    };

    const levelProgress = ((user.experience % 1000) / 1000) * 100;

    return (
        <div className="Dashboard">
            <div className="dashboard-header">
                <div className="user-info">
                    <div className="user-avatar">
                        {user.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-details">
                        <h2>{user.displayName}</h2>
                        <div className="user-level">
                            <span>Level {user.level}</span>
                            <div className="level-progress">
                                <div 
                                    className="level-progress-fill" 
                                    style={{ width: `${levelProgress}%` }}
                                />
                            </div>
                            <span>{user.experience % 1000}/1000 XP</span>
                        </div>
                    </div>
                </div>
                
                <div className="user-currency">
                    <div className="currency-item">
                        <span className="currency-icon coins">🪙</span>
                        <span>{user.coins.toLocaleString()}</span>
                    </div>
                    <div className="currency-item">
                        <span className="currency-icon diamonds">💎</span>
                        <span>{user.diamonds}</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="main-section">
                    <div className="game-modes">
                        <h3>Start Playing</h3>
                        <div className="mode-selection">
                            <button 
                                className={selectedGameMode === 'quick' ? 'active' : ''}
                                onClick={() => setSelectedGameMode('quick')}
                            >
                                Quick Match
                            </button>
                            <button 
                                className={selectedGameMode === 'ranked' ? 'active' : ''}
                                onClick={() => setSelectedGameMode('ranked')}
                            >
                                Ranked
                            </button>
                            <button 
                                className={selectedGameMode === 'custom' ? 'active' : ''}
                                onClick={() => setSelectedGameMode('custom')}
                            >
                                Custom
                            </button>
                        </div>

                        <div className="board-size-selection">
                            <label>Board Size:</label>
                            <select 
                                value={selectedBoardSize} 
                                onChange={(e) => setSelectedBoardSize(Number(e.target.value))}
                            >
                                <option value={5}>5x5 (Beginner)</option>
                                <option value={7}>7x7 (Easy)</option>
                                <option value={9}>9x9 (Classic)</option>
                                <option value={11}>11x11 (Expert)</option>
                            </select>
                        </div>

                        <button className="start-game-button" onClick={handleStartGame}>
                            Start Game
                        </button>
                    </div>

                    <div className="quick-stats">
                        <h3>Statistics</h3>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-value">{user.statistics.gamesWon}</div>
                                <div className="stat-label">Games Won</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{user.statistics.winRate.toFixed(1)}%</div>
                                <div className="stat-label">Win Rate</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{user.statistics.currentWinStreak}</div>
                                <div className="stat-label">Win Streak</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{user.statistics.perfectGames}</div>
                                <div className="stat-label">Perfect Games</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="sidebar">
                    <div className="missions-panel">
                        <h3>Daily Missions</h3>
                        {missions.map(mission => (
                            <div key={mission.id} className="mission-card">
                                <div className="mission-header">
                                    <h4>{mission.title}</h4>
                                    <span className={`mission-type ${mission.type}`}>
                                        {mission.type}
                                    </span>
                                </div>
                                <p>{mission.description}</p>
                                <div className="mission-progress">
                                    <div className="progress-bar">
                                        <div 
                                            className="progress-fill"
                                            style={{ width: `${mission.progress}%` }}
                                        />
                                    </div>
                                    <span>{mission.requirements[0].current}/{mission.requirements[0].target}</span>
                                </div>
                                <div className="mission-reward">
                                    {mission.rewards.map(reward => (
                                        <span key={reward.id} className="reward">
                                            {reward.type === 'coins' ? '🪙' : '💎'} {reward.amount}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="navigation-buttons">
                        <button onClick={() => navigate('/shop')}>
                            🛍️ Shop
                        </button>
                        <button onClick={() => navigate('/profile')}>
                            👤 Profile
                        </button>
                        <button onClick={() => navigate('/leaderboard')}>
                            🏆 Leaderboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}