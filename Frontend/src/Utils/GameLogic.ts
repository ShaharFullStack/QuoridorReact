import {
    GameState,
    GameMove,
    PlayerMove,
    WallMove,
    PlayerPosition,
    WallPosition,
    PlayerId,
    MoveValidation,
    WallValidation,
    GameConstants
} from '../Types';

/**
 * Game constants that can be adjusted based on board size
 */
export const getGameConstants = (boardSize: number): GameConstants => ({
    BOARD_SIZE: boardSize,
    WALLS_PER_PLAYER: Math.floor(boardSize * 1.1), // Dynamic walls based on board size
    CELL_SIZE: 2,
    CUBE_HEIGHT: 0.3,
    CUBE_GAP: 0.1,
    WALL_WIDTH: 0.2,
    WALL_HEIGHT: 1.2,
    BOARD_OFFSET: -((boardSize - 1) * 2) / 2
});

/**
 * Core game logic class
 */
export class GameLogic {
    private gameState: GameState;
    private constants: GameConstants;

    constructor(gameState: GameState) {
        this.gameState = gameState;
        this.constants = getGameConstants(gameState.boardSize);
    }

    /**
     * Check if a position is within board bounds
     */
    private isValidPosition(pos: PlayerPosition): boolean {
        return pos.x >= 0 && pos.x < this.constants.BOARD_SIZE && 
               pos.y >= 0 && pos.y < this.constants.BOARD_SIZE;
    }

    /**
     * Check if a position is occupied by another player
     */
    private isPositionOccupied(pos: PlayerPosition, excludePlayer?: PlayerId): boolean {
        for (const [playerId, player] of Object.entries(this.gameState.players)) {
            if (excludePlayer && Number(playerId) === excludePlayer) continue;
            if (player.position.x === pos.x && player.position.y === pos.y) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if there's a wall blocking movement between two adjacent positions
     */
    private isWallBlocking(from: PlayerPosition, to: PlayerPosition): boolean {
        const dx = to.x - from.x;
        const dy = to.y - from.y;

        // Check for walls based on movement direction
        for (const wall of this.gameState.walls) {
            const wp = wall.position;
            
            if (dx === 1) { // Moving right
                if (wall.position.orientation === 'vertical' &&
                    wp.x === from.x && 
                    (wp.y === from.y || wp.y === from.y - 1)) {
                    return true;
                }
            } else if (dx === -1) { // Moving left
                if (wall.position.orientation === 'vertical' &&
                    wp.x === from.x - 1 && 
                    (wp.y === from.y || wp.y === from.y - 1)) {
                    return true;
                }
            } else if (dy === 1) { // Moving down
                if (wall.position.orientation === 'horizontal' &&
                    wp.y === from.y && 
                    (wp.x === from.x || wp.x === from.x - 1)) {
                    return true;
                }
            } else if (dy === -1) { // Moving up
                if (wall.position.orientation === 'horizontal' &&
                    wp.y === from.y - 1 && 
                    (wp.x === from.x || wp.x === from.x - 1)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Get all valid moves for a player (including jumps)
     */
    public getValidMoves(playerId: PlayerId): PlayerPosition[] {
        const player = this.gameState.players[playerId];
        const validMoves: PlayerPosition[] = [];
        const directions = [
            { x: 0, y: 1 },  // Down
            { x: 0, y: -1 }, // Up
            { x: 1, y: 0 },  // Right
            { x: -1, y: 0 }  // Left
        ];

        for (const dir of directions) {
            const newPos = {
                x: player.position.x + dir.x,
                y: player.position.y + dir.y
            };

            // Check basic movement
            if (this.isValidPosition(newPos) && 
                !this.isWallBlocking(player.position, newPos)) {
                
                if (!this.isPositionOccupied(newPos)) {
                    validMoves.push(newPos);
                } else {
                    // Check for jump over opponent
                    const jumpPos = {
                        x: newPos.x + dir.x,
                        y: newPos.y + dir.y
                    };

                    if (this.isValidPosition(jumpPos) && 
                        !this.isPositionOccupied(jumpPos) &&
                        !this.isWallBlocking(newPos, jumpPos)) {
                        validMoves.push(jumpPos);
                    } else {
                        // Check diagonal moves when jump is blocked
                        const diagonals = [
                            { x: dir.y, y: dir.x },  // Perpendicular directions
                            { x: -dir.y, y: -dir.x }
                        ];

                        for (const diagDir of diagonals) {
                            const diagPos = {
                                x: newPos.x + diagDir.x,
                                y: newPos.y + diagDir.y
                            };

                            if (this.isValidPosition(diagPos) && 
                                !this.isPositionOccupied(diagPos) &&
                                !this.isWallBlocking(newPos, diagPos)) {
                                validMoves.push(diagPos);
                            }
                        }
                    }
                }
            }
        }

        return validMoves;
    }

    /**
     * Validate a player move
     */
    public validatePlayerMove(playerId: PlayerId, to: PlayerPosition): MoveValidation {
        const validMoves = this.getValidMoves(playerId);
        const isValid = validMoves.some(move => move.x === to.x && move.y === to.y);

        return {
            isValid,
            reason: isValid ? undefined : 'Invalid move',
            validMoves
        };
    }

    /**
     * Check if a wall placement is valid
     */
    public validateWallPlacement(playerId: PlayerId, wallPos: WallPosition): WallValidation {
        const player = this.gameState.players[playerId];
        
        // Check if player has walls left
        if (player.wallsLeft <= 0) {
            return {
                isValid: false,
                reason: 'No walls remaining'
            };
        }

        // Check if wall position is within bounds
        const maxCoord = this.constants.BOARD_SIZE - 2;
        if (wallPos.x < 0 || wallPos.x > maxCoord || wallPos.y < 0 || wallPos.y > maxCoord) {
            return {
                isValid: false,
                reason: 'Wall position out of bounds'
            };
        }

        // Check if wall overlaps with existing walls
        for (const existingWall of this.gameState.walls) {
            if (this.wallsOverlap(wallPos, existingWall.position)) {
                return {
                    isValid: false,
                    reason: 'Wall overlaps with existing wall'
                };
            }
        }

        // Check if wall blocks all paths to goal for any player
        const tempWall = { id: 'temp', position: wallPos, playerId };
        const tempState = {
            ...this.gameState,
            walls: [...this.gameState.walls, tempWall]
        };

        for (const [pid, p] of Object.entries(this.gameState.players)) {
            const playerIdNum = Number(pid) as PlayerId;
            if (!this.hasPathToGoal(tempState, playerIdNum)) {
                return {
                    isValid: false,
                    reason: `Wall would block player ${playerIdNum}'s path to goal`,
                    blocksPath: true
                };
            }
        }

        return { isValid: true };
    }

    /**
     * Check if two walls overlap
     */
    private wallsOverlap(wall1: WallPosition, wall2: WallPosition): boolean {
        if (wall1.orientation !== wall2.orientation) return false;

        if (wall1.orientation === 'horizontal') {
            return wall1.y === wall2.y && Math.abs(wall1.x - wall2.x) <= 1;
        } else {
            return wall1.x === wall2.x && Math.abs(wall1.y - wall2.y) <= 1;
        }
    }

    /**
     * Check if a player has a path to their goal using BFS
     */
    private hasPathToGoal(gameState: GameState, playerId: PlayerId): boolean {
        const player = gameState.players[playerId];
        const goalY = playerId === 1 ? 0 : this.constants.BOARD_SIZE - 1;
        
        const visited = new Set<string>();
        const queue: PlayerPosition[] = [player.position];
        visited.add(`${player.position.x},${player.position.y}`);

        while (queue.length > 0) {
            const current = queue.shift()!;
            
            // Check if reached goal
            if (current.y === goalY) {
                return true;
            }

            // Explore adjacent positions
            const directions = [
                { x: 0, y: 1 }, { x: 0, y: -1 }, 
                { x: 1, y: 0 }, { x: -1, y: 0 }
            ];

            for (const dir of directions) {
                const next = {
                    x: current.x + dir.x,
                    y: current.y + dir.y
                };

                const key = `${next.x},${next.y}`;
                if (visited.has(key)) continue;

                if (this.isValidPosition(next) && 
                    !this.isWallBlockingInState(gameState, current, next)) {
                    visited.add(key);
                    queue.push(next);
                }
            }
        }

        return false;
    }

    /**
     * Check if wall blocks movement in a specific game state
     */
    private isWallBlockingInState(gameState: GameState, from: PlayerPosition, to: PlayerPosition): boolean {
        const dx = to.x - from.x;
        const dy = to.y - from.y;

        for (const wall of gameState.walls) {
            const wp = wall.position;
            
            if (dx === 1) { // Moving right
                if (wall.position.orientation === 'vertical' &&
                    wp.x === from.x && 
                    (wp.y === from.y || wp.y === from.y - 1)) {
                    return true;
                }
            } else if (dx === -1) { // Moving left
                if (wall.position.orientation === 'vertical' &&
                    wp.x === from.x - 1 && 
                    (wp.y === from.y || wp.y === from.y - 1)) {
                    return true;
                }
            } else if (dy === 1) { // Moving down
                if (wall.position.orientation === 'horizontal' &&
                    wp.y === from.y && 
                    (wp.x === from.x || wp.x === from.x - 1)) {
                    return true;
                }
            } else if (dy === -1) { // Moving up
                if (wall.position.orientation === 'horizontal' &&
                    wp.y === from.y - 1 && 
                    (wp.x === from.x || wp.x === from.x - 1)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Execute a player move
     */
    public executePlayerMove(playerId: PlayerId, to: PlayerPosition): GameState {
        const validation = this.validatePlayerMove(playerId, to);
        if (!validation.isValid) {
            throw new Error(validation.reason);
        }

        const move: PlayerMove = {
            type: 'move',
            playerId,
            from: this.gameState.players[playerId].position,
            to
        };

        const newState: GameState = {
            ...this.gameState,
            players: {
                ...this.gameState.players,
                [playerId]: {
                    ...this.gameState.players[playerId],
                    position: to
                }
            },
            moveHistory: [...this.gameState.moveHistory, move],
            currentPlayer: playerId === 1 ? 2 : 1
        };

        // Check for win condition
        const goalY = playerId === 1 ? 0 : this.constants.BOARD_SIZE - 1;
        if (to.y === goalY) {
            newState.phase = 'finished';
            newState.winner = playerId;
        }

        return newState;
    }

    /**
     * Execute a wall placement
     */
    public executeWallPlacement(playerId: PlayerId, wallPos: WallPosition): GameState {
        const validation = this.validateWallPlacement(playerId, wallPos);
        if (!validation.isValid) {
            throw new Error(validation.reason);
        }

        const wall = {
            id: `wall-${Date.now()}-${Math.random()}`,
            position: wallPos,
            playerId
        };

        const move: WallMove = {
            type: 'wall',
            playerId,
            position: wallPos
        };

        const newState: GameState = {
            ...this.gameState,
            players: {
                ...this.gameState.players,
                [playerId]: {
                    ...this.gameState.players[playerId],
                    wallsLeft: this.gameState.players[playerId].wallsLeft - 1
                }
            },
            walls: [...this.gameState.walls, wall],
            moveHistory: [...this.gameState.moveHistory, move],
            currentPlayer: playerId === 1 ? 2 : 1
        };

        return newState;
    }

    /**
     * Get the shortest path to goal for a player (for AI)
     */
    public getShortestPathToGoal(playerId: PlayerId): PlayerPosition[] {
        const player = this.gameState.players[playerId];
        const goalY = playerId === 1 ? 0 : this.constants.BOARD_SIZE - 1;
        
        const visited = new Map<string, { pos: PlayerPosition; parent: string | null; distance: number }>();
        const queue: PlayerPosition[] = [player.position];
        
        const startKey = `${player.position.x},${player.position.y}`;
        visited.set(startKey, { pos: player.position, parent: null, distance: 0 });

        while (queue.length > 0) {
            const current = queue.shift()!;
            const currentKey = `${current.x},${current.y}`;
            
            // Check if reached goal
            if (current.y === goalY) {
                // Reconstruct path
                const path: PlayerPosition[] = [];
                let key: string | null = currentKey;
                
                while (key !== null) {
                    const node = visited.get(key)!;
                    path.unshift(node.pos);
                    key = node.parent;
                }
                
                return path.slice(1); // Remove starting position
            }

            // Explore adjacent positions
            const directions = [
                { x: 0, y: 1 }, { x: 0, y: -1 }, 
                { x: 1, y: 0 }, { x: -1, y: 0 }
            ];

            for (const dir of directions) {
                const next = {
                    x: current.x + dir.x,
                    y: current.y + dir.y
                };

                const nextKey = `${next.x},${next.y}`;
                if (visited.has(nextKey)) continue;

                if (this.isValidPosition(next) && 
                    !this.isWallBlocking(current, next)) {
                    
                    const currentDistance = visited.get(currentKey)!.distance;
                    visited.set(nextKey, { 
                        pos: next, 
                        parent: currentKey, 
                        distance: currentDistance + 1 
                    });
                    queue.push(next);
                }
            }
        }

        return []; // No path found
    }

    /**
     * Update internal game state
     */
    public updateGameState(newState: GameState): void {
        this.gameState = newState;
        this.constants = getGameConstants(newState.boardSize);
    }
}

/**
 * Helper function to create initial game state
 */
export const createInitialGameState = (
    boardSize: number = 9,
    gameMode: 'pvp' | 'pvc' = 'pvp',
    aiLevel: 'easy' | 'medium' | 'hard' = 'medium'
): GameState => {
    const constants = getGameConstants(boardSize);
    
    return {
        phase: 'waiting',
        mode: gameMode,
        aiLevel,
        currentPlayer: 1,
        players: {
            1: {
                id: 1,
                color: 'blue',
                position: { 
                    x: Math.floor(boardSize / 2), 
                    y: boardSize - 1 
                },
                wallsLeft: constants.WALLS_PER_PLAYER,
                isAI: false
            },
            2: {
                id: 2,
                color: 'red',
                position: { 
                    x: Math.floor(boardSize / 2), 
                    y: 0 
                },
                wallsLeft: constants.WALLS_PER_PLAYER,
                isAI: gameMode === 'pvc'
            }
        },
        walls: [],
        winner: null,
        moveHistory: [],
        boardSize
    };
};