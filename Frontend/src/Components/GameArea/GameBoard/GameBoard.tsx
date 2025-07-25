import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { GameConstants, GameSettings, GameState, PlayerPosition, WallPosition } from '../../../Types';
import { usePBRMaterial, MATERIAL_CONFIGS, useHighlightMaterial, useWallPlaceholderMaterial } from '../../../Utils/MaterialsSystem';

interface GameBoardProps {
    boardSize: number;
    constants: GameConstants;
    gameSettings: GameSettings;
    gameState: GameState; // Added to access visual indicator state
    onCellClick?: (x: number, y: number) => void;
    onWallClick?: (x: number, y: number, orientation: 'horizontal' | 'vertical') => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
    boardSize,
    constants,
    gameSettings,
    gameState,
    onCellClick,
    onWallClick
}) => {
    const groupRef = useRef<THREE.Group>(null);
    // Removed old hover state - now using game state based indicators

    // Load sophisticated PBR materials (matching original exactly)
    const boardMaterial = usePBRMaterial(MATERIAL_CONFIGS.board);
    const goalMaterial = usePBRMaterial(MATERIAL_CONFIGS.goal);
    const groundMaterial = usePBRMaterial(MATERIAL_CONFIGS.ground);
    const highlightMoveMaterial = useHighlightMaterial('highlightMove');
    const wallPlaceholderMaterial = useWallPlaceholderMaterial();
    const highlightFirstWallMaterial = useHighlightMaterial('highlightFirstWall');
    const highlightSecondWallMaterial = useHighlightMaterial('highlightSecondWall');

    // Generate board cells with exact positioning from original
    const boardCells = useMemo(() => {
        const cells = [];
        
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                const coords = {
                    x: constants.BOARD_OFFSET + col * constants.CELL_SIZE,
                    z: constants.BOARD_OFFSET + row * constants.CELL_SIZE
                };
                
                // Random rotation for visual variety (matches original)
                const randomRotation = (Math.random() - 0.5) * 0.1;
                
                cells.push({
                    key: `cell-${row}-${col}`,
                    row,
                    col,
                    coords,
                    rotation: randomRotation,
                    isGoal: row === 0 || row === boardSize - 1
                });
            }
        }
        
        return cells;
    }, [boardSize, constants]);

    // Generate wall placeholder positions (matching original grid system)
    const wallPlaceholders = useMemo(() => {
        const placeholders = [];
        
        // Horizontal wall placeholders
        for (let r = 0; r < boardSize - 1; r++) {
            for (let c = 0; c < boardSize - 1; c++) {
                placeholders.push({
                    key: `h-wall-${r}-${c}`,
                    type: 'horizontal' as const,
                    row: r,
                    col: c,
                    position: [
                        constants.BOARD_OFFSET + c * constants.CELL_SIZE + constants.CELL_SIZE/2,
                        constants.CUBE_HEIGHT + 0.05,
                        constants.BOARD_OFFSET + r * constants.CELL_SIZE + constants.CELL_SIZE/2
                    ] as [number, number, number]
                });
            }
        }
        
        // Vertical wall placeholders
        for (let r = 0; r < boardSize - 1; r++) {
            for (let c = 0; c < boardSize - 1; c++) {
                placeholders.push({
                    key: `v-wall-${r}-${c}`,
                    type: 'vertical' as const,
                    row: r,
                    col: c,
                    position: [
                        constants.BOARD_OFFSET + c * constants.CELL_SIZE + constants.CELL_SIZE/2,
                        constants.CUBE_HEIGHT + 0.05,
                        constants.BOARD_OFFSET + r * constants.CELL_SIZE + constants.CELL_SIZE/2
                    ] as [number, number, number]
                });
            }
        }
        
        return placeholders;
    }, [boardSize, constants]);

    // Handle interactions
    const handleCellClick = (row: number, col: number) => {
        if (onCellClick) {
            onCellClick(col, row); // Convert to x, y coordinates
        }
    };

    const handleWallClick = (row: number, col: number, orientation: 'horizontal' | 'vertical') => {
        if (onWallClick) {
            onWallClick(col, row, orientation); // Convert to x, y coordinates
        }
    };

    return (
        <group ref={groupRef} name="sophisticated-game-board">
            {/* Textured ground plane with displacement - matches original exactly */}
            <mesh 
                rotation={[-Math.PI / 2, 0, 0]} 
                position={[0, -1.3, 0]} 
                receiveShadow
            >
                <planeGeometry args={[40, 40, 128, 128]} />
                <primitive object={groundMaterial} />
            </mesh>

            {/* Board cells with sophisticated materials */}
            {boardCells.map((cell) => {
                // Determine material based on game mode and valid moves (matching original exactly)
                let material: THREE.Material = cell.isGoal ? goalMaterial : boardMaterial;
                
                // Highlight valid moves when in move mode (from original updateScene)
                if (gameState.gameMode === 'move') {
                    const isValidMove = gameState.validMoves.some(move => 
                        move.x === cell.col && move.y === cell.row
                    );
                    if (isValidMove) {
                        material = highlightMoveMaterial;
                    }
                }
                
                return (
                    <mesh
                        key={cell.key}
                        position={[cell.coords.x, constants.CUBE_HEIGHT / 2 - 1, cell.coords.z]}
                        rotation={[0, cell.rotation, 0]}
                        castShadow
                        receiveShadow
                        onClick={() => handleCellClick(cell.row, cell.col)}
                        userData={{ type: 'cell', row: cell.row, col: cell.col }}
                    >
                        <boxGeometry args={[
                            constants.CELL_SIZE - constants.CUBE_GAP,
                            constants.CUBE_HEIGHT,
                            constants.CELL_SIZE - constants.CUBE_GAP
                        ]} />
                        <primitive object={material} />
                    </mesh>
                );
            })}

            {/* Wall placeholders with exact original highlighting system */}
            {wallPlaceholders.map((placeholder) => {
                // Determine visibility and material based on game mode (matching original updateScene)
                let isVisible = false;
                let material: THREE.Material = wallPlaceholderMaterial;
                
                if (gameState.gameMode === 'wall') {
                    if (gameState.wallPlacementStage === 1) {
                        // Stage 1: Show available wall placeholders (from original updateScene lines 107-126)
                        const existingWalls = gameState.walls;
                        let canPlace = true;
                        
                        if (placeholder.type === 'horizontal') {
                            // Check if horizontal wall already exists
                            const seg1Key = `${placeholder.row}-${placeholder.col}`;
                            const seg2Key = `${placeholder.row}-${placeholder.col + 1}`;
                            canPlace = !existingWalls.some(wall => 
                                wall.position.orientation === 'horizontal' &&
                                (`${wall.position.y}-${wall.position.x}` === seg1Key ||
                                 `${wall.position.y}-${wall.position.x}` === seg2Key)
                            );
                        } else {
                            // Check if vertical wall already exists
                            const seg1Key = `${placeholder.row}-${placeholder.col}`;
                            const seg2Key = `${placeholder.row + 1}-${placeholder.col}`;
                            canPlace = !existingWalls.some(wall => 
                                wall.position.orientation === 'vertical' &&
                                (`${wall.position.y}-${wall.position.x}` === seg1Key ||
                                 `${wall.position.y}-${wall.position.x}` === seg2Key)
                            );
                        }
                        
                        if (canPlace) {
                            isVisible = true;
                            material = wallPlaceholderMaterial; // Blue placeholder
                        }
                    } else if (gameState.wallPlacementStage === 2 && gameState.firstWallSegment) {
                        // Stage 2: Show first wall segment and possible second segments (lines 127-150)
                        const firstSeg = gameState.firstWallSegment;
                        
                        // Highlight the first selected wall segment with orange
                        if (firstSeg.orientation === placeholder.type &&
                            firstSeg.x === placeholder.col &&
                            firstSeg.y === placeholder.row) {
                            isVisible = true;
                            material = highlightFirstWallMaterial; // Orange
                        }
                        // Show possible second segments with green highlighting
                        else if (firstSeg.orientation === placeholder.type) {
                            let isPossibleSecond = false;
                            
                            if (placeholder.type === 'horizontal') {
                                // Adjacent horizontal segments
                                isPossibleSecond = (
                                    (firstSeg.y === placeholder.row && Math.abs(firstSeg.x - placeholder.col) === 1) ||
                                    (firstSeg.x === placeholder.col && Math.abs(firstSeg.y - placeholder.row) === 1)
                                );
                            } else {
                                // Adjacent vertical segments
                                isPossibleSecond = (
                                    (firstSeg.y === placeholder.row && Math.abs(firstSeg.x - placeholder.col) === 1) ||
                                    (firstSeg.x === placeholder.col && Math.abs(firstSeg.y - placeholder.row) === 1)
                                );
                            }
                            
                            if (isPossibleSecond) {
                                isVisible = true;
                                material = highlightSecondWallMaterial; // Green
                            }
                        }
                    }
                }
                
                const geometry = placeholder.type === 'horizontal' 
                    ? [constants.CELL_SIZE * 2, constants.WALL_WIDTH * 4] 
                    : [constants.WALL_WIDTH * 4, constants.CELL_SIZE * 2];

                return (
                    <mesh
                        key={placeholder.key}
                        position={placeholder.position}
                        rotation={[-Math.PI / 2, 0, 0]}
                        visible={isVisible}
                        onClick={() => handleWallClick(placeholder.row, placeholder.col, placeholder.type)}
                        userData={{ 
                            type: `${placeholder.type}_wall_placeholder`, 
                            wallType: placeholder.type,
                            row: placeholder.row, 
                            col: placeholder.col 
                        }}
                    >
                        <planeGeometry args={geometry.slice(0, 4) as [number, number, number?, number?]} />
                        <primitive object={material} />
                    </mesh>
                );
            })}
        </group>
    );
};