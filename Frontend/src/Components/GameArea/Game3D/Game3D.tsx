import React, { useState, useCallback, useMemo, memo } from 'react';
import { GameState, GameSettings, PlayerId, PlayerPosition, WallPosition } from '../../../Types';
import { GameLogic } from '../../../Utils/GameLogic';
import { QuoridorScene } from '../QuoridorScene/QuoridorScene';
import { LoadingSpinner } from '../../Common/LoadingSpinner/LoadingSpinner';
import './Game3D.css';
import './Game3D_buttons.css';

interface Game3DProps {
    gameState: GameState;
    gameSettings: GameSettings;
    onGameStateChange: (newState: GameState) => void;
    onGameEnd: (winner: PlayerId) => void;
}

const Game3D: React.FC<Game3DProps> = memo(({
    gameState,
    gameSettings,
    onGameStateChange,
    onGameEnd
}) => {
    // Memoize GameLogic instance to prevent unnecessary recreations
    const gameLogic = useMemo(() => new GameLogic(gameState), [gameState.boardSize]);
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
        if (gameState.phase !== 'playing' || gameState.gameMode !== 'move') return;
        
        const currentPlayer = gameState.currentPlayer;
        const targetPosition: PlayerPosition = { x, y };

        try {
            const validation = gameLogic.validatePlayerMove(currentPlayer, targetPosition);
            
            if (validation.isValid) {
                const newState = gameLogic.executePlayerMove(currentPlayer, targetPosition);
                
                // Update valid moves for next player (matching original exactly)
                const nextGameLogic = new GameLogic(newState);
                newState.validMoves = nextGameLogic.getValidMoves(newState.currentPlayer);
                
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

    // Handle wall placement clicks - Two-stage system matching original exactly
    const handleWallClick = useCallback((x: number, y: number, orientation: 'horizontal' | 'vertical') => {
        if (gameState.phase !== 'playing' || gameState.gameMode !== 'wall') return;
        
        const currentPlayer = gameState.currentPlayer;
        const wallPosition: WallPosition = { x, y, orientation };

        try {
            if (gameState.wallPlacementStage === 1) {
                // Stage 1: Select first wall segment
                const newState = {
                    ...gameState,
                    wallPlacementStage: 2 as const,
                    firstWallSegment: wallPosition
                };
                onGameStateChange(newState);
            } else if (gameState.wallPlacementStage === 2 && gameState.firstWallSegment) {
                // Stage 2: Validate and place complete wall
                const firstSeg = gameState.firstWallSegment;
                
                // Check if segments form a valid wall (adjacent and same orientation)
                const isValidPair = (
                    firstSeg.orientation === wallPosition.orientation &&
                    (
                        (Math.abs(firstSeg.x - wallPosition.x) === 1 && firstSeg.y === wallPosition.y) ||
                        (Math.abs(firstSeg.y - wallPosition.y) === 1 && firstSeg.x === wallPosition.x)
                    )
                );
                
                if (isValidPair) {
                    // Create the complete wall at the minimum position
                    const wallPos = {
                        x: Math.min(firstSeg.x, wallPosition.x),
                        y: Math.min(firstSeg.y, wallPosition.y),
                        orientation: firstSeg.orientation
                    };
                    
                    const validation = gameLogic.validateWallPlacement(currentPlayer, wallPos);
                    
                    if (validation.isValid) {
                        const newState = gameLogic.executeWallPlacement(currentPlayer, wallPos);
                        
                        // Reset wall placement state and update valid moves
                        newState.gameMode = 'move';
                        newState.wallPlacementStage = 1;
                        newState.firstWallSegment = null;
                        
                        const nextGameLogic = new GameLogic(newState);
                        newState.validMoves = nextGameLogic.getValidMoves(newState.currentPlayer);
                        
                        onGameStateChange(newState);
                    } else {
                        console.log('Invalid wall placement:', validation.reason);
                        // Reset wall placement on invalid placement
                        const resetState = {
                            ...gameState,
                            wallPlacementStage: 1 as const,
                            firstWallSegment: null as WallPosition | null
                        };
                        onGameStateChange(resetState);
                    }
                } else {
                    console.log('Invalid wall segment pair - must be adjacent');
                    // Reset to stage 1 with new first segment
                    const newState = {
                        ...gameState,
                        firstWallSegment: wallPosition
                    };
                    onGameStateChange(newState);
                }
            }
        } catch (error) {
            console.error('Wall placement failed:', error);
            setError(error instanceof Error ? error.message : 'Wall placement failed');
        }
    }, [gameState, gameLogic, onGameStateChange]);

    return (
        <div className="Game3D">
            {isLoading && (
                <LoadingSpinner
                    fullScreen
                    size="large"
                    text="Loading 3D scene..."
                    variant="primary"
                />
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
                                Player {gameState.currentPlayer}'s Turn - {gameState.gameMode === 'move' ? 'Move' : 'Wall'} Mode
                                {gameState.gameMode === 'wall' && gameState.wallPlacementStage === 2 && (
                                    <span className="wall-stage-indicator"> (Select second segment)</span>
                                )}
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
                    
                    {/* Game mode buttons matching original */}
                    {gameState.phase === 'playing' && (
                        <div className="game-mode-buttons">
                            <button 
                                className={`mode-btn ${gameState.gameMode === 'move' ? 'active' : ''}`}
                                onClick={() => {
                                    const newState = {
                                        ...gameState,
                                        gameMode: 'move' as const,
                                        wallPlacementStage: 1 as const,
                                        firstWallSegment: null as WallPosition | null
                                    };
                                    onGameStateChange(newState);
                                }}
                            >
                                Move
                            </button>
                            <button 
                                className={`mode-btn ${gameState.gameMode === 'wall' ? 'active' : ''}`}
                                onClick={() => {
                                    const newState = {
                                        ...gameState,
                                        gameMode: 'wall' as const,
                                        wallPlacementStage: 1 as const,
                                        firstWallSegment: null as WallPosition | null
                                    };
                                    onGameStateChange(newState);
                                }}
                                disabled={gameState.players[gameState.currentPlayer].wallsLeft <= 0}
                            >
                                Wall ({gameState.players[gameState.currentPlayer].wallsLeft} left)
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

Game3D.displayName = 'Game3D';

export default Game3D;