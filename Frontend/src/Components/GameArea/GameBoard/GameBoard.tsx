import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { GameConstants, GameSettings } from '../../../Types';
import { usePBRMaterial, MATERIAL_CONFIGS, useHighlightMaterial, useWallPlaceholderMaterial } from '../../../Utils/MaterialsSystem';

interface GameBoardProps {
    boardSize: number;
    constants: GameConstants;
    gameSettings: GameSettings;
    onCellClick?: (x: number, y: number) => void;
    onWallClick?: (x: number, y: number, orientation: 'horizontal' | 'vertical') => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
    boardSize,
    constants,
    gameSettings,
    onCellClick,
    onWallClick
}) => {
    const groupRef = useRef<THREE.Group>(null);
    const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);
    const [hoveredWall, setHoveredWall] = useState<{ x: number; y: number; orientation: 'horizontal' | 'vertical' } | null>(null);

    // Load sophisticated PBR materials (matching original exactly)
    const boardMaterial = usePBRMaterial(MATERIAL_CONFIGS.board);
    const goalMaterial = usePBRMaterial(MATERIAL_CONFIGS.goal);
    const groundMaterial = usePBRMaterial(MATERIAL_CONFIGS.ground);
    const highlightMoveMaterial = useHighlightMaterial('highlightMove');
    const wallPlaceholderMaterial = useWallPlaceholderMaterial();

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
                const isHovered = hoveredCell?.x === cell.col && hoveredCell?.y === cell.row;
                const material = cell.isGoal ? goalMaterial : boardMaterial;
                
                return (
                    <group key={cell.key}>
                        <mesh
                            position={[cell.coords.x, constants.CUBE_HEIGHT / 2 - 1, cell.coords.z]}
                            rotation={[0, cell.rotation, 0]}
                            castShadow
                            receiveShadow
                            onClick={() => handleCellClick(cell.row, cell.col)}
                            onPointerEnter={() => setHoveredCell({ x: cell.col, y: cell.row })}
                            onPointerLeave={() => setHoveredCell(null)}
                            userData={{ type: 'cell', row: cell.row, col: cell.col }}
                        >
                            <boxGeometry args={[
                                constants.CELL_SIZE - constants.CUBE_GAP,
                                constants.CUBE_HEIGHT,
                                constants.CELL_SIZE - constants.CUBE_GAP
                            ]} />
                            <primitive object={material} />
                        </mesh>

                        {/* Hover effect */}
                        {isHovered && (
                            <mesh
                                position={[cell.coords.x, constants.CUBE_HEIGHT + 0.1, cell.coords.z]}
                                rotation={[-Math.PI / 2, 0, 0]}
                            >
                                <ringGeometry args={[0.8, 1.0, 16]} />
                                <primitive object={highlightMoveMaterial} />
                            </mesh>
                        )}
                    </group>
                );
            })}

            {/* Wall placeholders (invisible until hover) - matches original system */}
            {wallPlaceholders.map((placeholder) => {
                const isHovered = hoveredWall?.x === placeholder.col && 
                                 hoveredWall?.y === placeholder.row && 
                                 hoveredWall?.orientation === placeholder.type;
                
                const geometry = placeholder.type === 'horizontal' 
                    ? [constants.CELL_SIZE * 2, constants.WALL_WIDTH * 4] 
                    : [constants.WALL_WIDTH * 4, constants.CELL_SIZE * 2];

                return (
                    <mesh
                        key={placeholder.key}
                        position={placeholder.position}
                        rotation={[-Math.PI / 2, 0, 0]}
                        visible={isHovered}
                        onClick={() => handleWallClick(placeholder.row, placeholder.col, placeholder.type)}
                        onPointerEnter={() => setHoveredWall({ 
                            x: placeholder.col, 
                            y: placeholder.row, 
                            orientation: placeholder.type 
                        })}
                        onPointerLeave={() => setHoveredWall(null)}
                        userData={{ 
                            type: `${placeholder.type}_wall_placeholder`, 
                            wallType: placeholder.type,
                            row: placeholder.row, 
                            col: placeholder.col 
                        }}
                    >
                        <planeGeometry args={geometry} />
                        <primitive object={wallPlaceholderMaterial} />
                    </mesh>
                );
            })}
        </group>
    );
};