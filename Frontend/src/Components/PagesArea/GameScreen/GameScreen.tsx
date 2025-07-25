import React, { useState, useEffect, Suspense } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GameSettings, GameState, PlayerId } from '../../../Types';
import './GameScreen.css';

// Lazy load the 3D game component
const Game3D = React.lazy(() => import('../../GameArea/Game3D/Game3D'));

export function GameScreen(): JSX.Element {
    const location = useLocation();
    const navigate = useNavigate();
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Get game settings from navigation state
    const gameSettings = location.state?.gameSettings as GameSettings;
    const gameMode = location.state?.gameMode as string;

    useEffect(() => {
        if (!gameSettings) {
            // No game settings provided, redirect to dashboard
            navigate('/dashboard');
            return;
        }

        // Initialize game state
        const initialGameState: GameState = {
            phase: 'playing',
            mode: gameMode === 'ranked' ? 'pvc' : 'pvp',
            aiLevel: gameSettings.aiLevel,
            currentPlayer: 1,
            players: {
                1: {
                    id: 1,
                    color: 'blue',
                    position: { 
                        x: Math.floor(gameSettings.boardSize / 2), 
                        y: gameSettings.boardSize - 1 
                    },
                    wallsLeft: Math.floor(gameSettings.boardSize * 1.1), // Dynamic walls based on board size
                    isAI: false
                },
                2: {
                    id: 2,
                    color: 'red',
                    position: { 
                        x: Math.floor(gameSettings.boardSize / 2), 
                        y: 0 
                    },
                    wallsLeft: Math.floor(gameSettings.boardSize * 1.1),
                    isAI: gameMode === 'ranked'
                }
            },
            walls: [],
            winner: null,
            moveHistory: [],
            boardSize: gameSettings.boardSize
        };

        setGameState(initialGameState);
        setIsLoading(false);
    }, [gameSettings, gameMode, navigate]);

    const handleGameEnd = (winner: PlayerId) => {
        if (gameState) {
            setGameState({
                ...gameState,
                phase: 'finished',
                winner
            });
        }
    };

    const handleBackToDashboard = () => {
        navigate('/dashboard');
    };

    if (isLoading || !gameState) {
        return (
            <div className="GameScreen loading">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading game...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="GameScreen">
            <div className="game-header">
                <div className="game-info">
                    <h2>Quoridor 3D - {gameSettings.boardSize}x{gameSettings.boardSize}</h2>
                    <div className="game-mode-indicator">
                        {gameState.mode === 'pvc' ? 'vs AI' : 'vs Player'}
                        {gameState.mode === 'pvc' && ` (${gameState.aiLevel})`}
                    </div>
                </div>
                
                <div className="game-controls">
                    <button 
                        className="back-button"
                        onClick={handleBackToDashboard}
                    >
                        ← Back to Dashboard
                    </button>
                    <div className="current-player">
                        Player {gameState.currentPlayer}'s Turn
                        <div 
                            className={`player-indicator ${gameState.players[gameState.currentPlayer].color}`}
                        />
                    </div>
                </div>
            </div>

            <div className="game-container">
                <div className="game-sidebar">
                    <div className="player-info">
                        <div className="player-card player-1">
                            <div className="player-header">
                                <div className="player-color blue"></div>
                                <span>Player 1</span>
                            </div>
                            <div className="walls-remaining">
                                Walls: {gameState.players[1].wallsLeft}
                            </div>
                        </div>

                        <div className="player-card player-2">
                            <div className="player-header">
                                <div className="player-color red"></div>
                                <span>Player 2 {gameState.players[2].isAI ? '(AI)' : ''}</span>
                            </div>
                            <div className="walls-remaining">
                                Walls: {gameState.players[2].wallsLeft}
                            </div>
                        </div>
                    </div>

                    <div className="game-stats">
                        <div className="stat">
                            <label>Moves:</label>
                            <span>{gameState.moveHistory.length}</span>
                        </div>
                        <div className="stat">
                            <label>Board:</label>
                            <span>{gameSettings.boardSize}x{gameSettings.boardSize}</span>
                        </div>
                    </div>
                </div>

                <div className="game-3d-container">
                    <Suspense fallback={
                        <div className="game-loading">
                            <div className="loading-spinner"></div>
                            <p>Loading 3D scene...</p>
                        </div>
                    }>
                        <Game3D 
                            gameState={gameState}
                            gameSettings={gameSettings}
                            onGameStateChange={setGameState}
                            onGameEnd={handleGameEnd}
                        />
                    </Suspense>
                </div>
            </div>

            {gameState.phase === 'finished' && (
                <div className="game-over-overlay">
                    <div className="game-over-modal">
                        <h2>Game Over!</h2>
                        <p>Player {gameState.winner} Wins!</p>
                        <div className="game-over-buttons">
                            <button onClick={handleBackToDashboard}>
                                Back to Dashboard
                            </button>
                            <button onClick={() => window.location.reload()}>
                                Play Again
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}