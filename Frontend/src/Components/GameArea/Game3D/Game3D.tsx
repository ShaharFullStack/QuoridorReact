import React, { useState, useCallback } from 'react';
import { GameState, GameSettings, PlayerId, PlayerPosition, WallPosition } from '../../../Types';
import { GameLogic } from '../../../Utils/GameLogic';
import { QuoridorScene } from '../QuoridorScene/QuoridorScene';
import './Game3D.css';

interface Game3DProps {
    gameState: GameState;
    gameSettings: GameSettings;
    onGameStateChange: (newState: GameState) => void;
    onGameEnd: (winner: PlayerId) => void;
}

const Game3D: React.FC<Game3DProps> = ({
    gameState,
    gameSettings,
    onGameStateChange,
    onGameEnd
}) => {
    const [gameLogic] = useState(() => new GameLogic(gameState));
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Update game logic when state changes
    React.useEffect(() => {
        gameLogic.updateGameState(gameState);
    }, [gameState, gameLogic]);

    // Handle loading state
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500); // Simulate loading time for 3D assets

        return () => clearTimeout(timer);
    }, []);

    // Handle cell clicks (player movement)
    const handleCellClick = useCallback((x: number, y: number) => {
        if (gameState.phase !== 'playing') return;
        
        const currentPlayer = gameState.currentPlayer;
        const targetPosition: PlayerPosition = { x, y };

        try {
            const validation = gameLogic.validatePlayerMove(currentPlayer, targetPosition);
            
            if (validation.isValid) {
                const newState = gameLogic.executePlayerMove(currentPlayer, targetPosition);
                onGameStateChange(newState);
                
                // Check for game end
                if (newState.phase === 'finished' && newState.winner) {
                    onGameEnd(newState.winner);
                }
            } else {
                console.log('Invalid move:', validation.reason);
                // TODO: Show user feedback for invalid moves
            }
        } catch (error) {
            console.error('Move execution failed:', error);
            setError(error instanceof Error ? error.message : 'Move failed');
        }
    }, [gameState, gameLogic, onGameStateChange, onGameEnd]);

    // Handle wall placement clicks
    const handleWallClick = useCallback((x: number, y: number, orientation: 'horizontal' | 'vertical') => {
        if (gameState.phase !== 'playing') return;
        
        const currentPlayer = gameState.currentPlayer;
        const wallPosition: WallPosition = { x, y, orientation };

        try {
            const validation = gameLogic.validateWallPlacement(currentPlayer, wallPosition);
            
            if (validation.isValid) {
                const newState = gameLogic.executeWallPlacement(currentPlayer, wallPosition);
                onGameStateChange(newState);
            } else {
                console.log('Invalid wall placement:', validation.reason);
                // TODO: Show user feedback for invalid wall placement
            }
        } catch (error) {
            console.error('Wall placement failed:', error);
            setError(error instanceof Error ? error.message : 'Wall placement failed');
        }
    }, [gameState, gameLogic, onGameStateChange]);

    return (
        <div className="Game3D">
            {isLoading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                    <p>Loading 3D scene...</p>
                    <p className="loading-note">Initializing React Three Fiber...</p>
                </div>
            )}
            
            {error && (
                <div className="error-overlay">
                    <div className="error-message">
                        <h3>Game Error</h3>
                        <p>{error}</p>
                        <button onClick={() => setError(null)}>
                            Dismiss
                        </button>
                    </div>
                </div>
            )}
            
            {!isLoading && (
                <div className="game-canvas-container">
                    <QuoridorScene
                        gameState={gameState}
                        gameSettings={gameSettings}
                        onCellClick={handleCellClick}
                        onWallClick={handleWallClick}
                    />
                </div>
            )}
            
            <div className="game-overlay">
                <div className="game-info">
                    <div className="current-turn">
                        {gameState.phase === 'playing' && (
                            <>
                                Player {gameState.currentPlayer}'s Turn
                                <div className={`turn-indicator ${gameState.players[gameState.currentPlayer].color}`} />
                            </>
                        )}
                    </div>
                    
                    <div className="game-status">
                        {gameState.phase === 'finished' && (
                            <div className="game-finished">
                                Player {gameState.winner} Wins!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Game3D;