import React, { useRef, useState, useEffect } from 'react';
import { CornCharacter, SmokingCharacter } from './GameCharacters';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { Player, GameConstants, GamePhase } from '../../../Types';

interface GamePawnProps {
    player: Player;
    constants: GameConstants;
    isCurrentPlayer: boolean;
    gamePhase: GamePhase;
}

export const GamePawn: React.FC<GamePawnProps> = ({
    player,
    constants,
    isCurrentPlayer,
    gamePhase
}) => {
    const meshRef = useRef<THREE.Group>(null);
    const glowRef = useRef<THREE.Mesh>(null);
    const [isHovered, setIsHovered] = useState(false);
    
    // Animation state for smooth movement (like original game)
    const [animationState, setAnimationState] = useState({
        isAnimating: false,
        startPos: { x: 0, z: 0 },
        endPos: { x: 0, z: 0 },
        progress: 0,
        duration: 0.8
    });

    // Calculate world position from grid position (exactly like original)
    const posToCoords = (pos: {x: number, y: number}) => ({ 
        x: constants.BOARD_OFFSET + pos.x * constants.CELL_SIZE, 
        z: constants.BOARD_OFFSET + pos.y * constants.CELL_SIZE 
    });
    
    const baseWorldPosition: [number, number, number] = [
        constants.BOARD_OFFSET + player.position.x * constants.CELL_SIZE,
        constants.CUBE_HEIGHT + 1.5 - 1, // Exact original formula: CUBE_HEIGHT + 0.5
        constants.BOARD_OFFSET + player.position.y * constants.CELL_SIZE
    ];

    // Track position changes to trigger movement animation
    const prevPosition = useRef(player.position);
    React.useEffect(() => {
        if (prevPosition.current.x !== player.position.x || prevPosition.current.y !== player.position.y) {
            // Start movement animation using original coordinate system
            const startCoords = posToCoords(prevPosition.current);
            const endCoords = posToCoords(player.position);
            
            setAnimationState({
                isAnimating: true,
                startPos: { x: startCoords.x, z: startCoords.z },
                endPos: { x: endCoords.x, z: endCoords.z },
                progress: 0,
                duration: 0.8
            });
            
            prevPosition.current = player.position;
        }
    }, [player.position, constants]);

    // Calculate current position during animation
    const worldPosition: [number, number, number] = React.useMemo(() => {
        if (!animationState.isAnimating) {
            return baseWorldPosition;
        }
        
        // Smooth easing function (like original)
        const easeProgress = animationState.progress < 0.5 
            ? 2 * animationState.progress * animationState.progress 
            : -1 + (4 - 2 * animationState.progress) * animationState.progress;
            
        const currentX = animationState.startPos.x + (animationState.endPos.x - animationState.startPos.x) * easeProgress;
        const currentZ = animationState.startPos.z + (animationState.endPos.z - animationState.startPos.z) * easeProgress;
        
        // Add jumping arc (matching original exactly)
        const arcHeight = Math.sin(animationState.progress * Math.PI) * 0.8;
        const playerHeight = constants.CUBE_HEIGHT + 1.5 - 1 + arcHeight; // Original formula
        
        return [currentX, playerHeight, currentZ];
    }, [animationState, baseWorldPosition, constants]);

    // Player colors
    const playerColors = {
        blue: {
            main: 0x3498db,
            emissive: 0x1e5f99,
            glow: 0x74b9ff
        },
        red: {
            main: 0xe74c3c,
            emissive: 0x99321e,
            glow: 0xff7675
        }
    };

    const colors = playerColors[player.color];

    // Animation effects
    useFrame((state, delta) => {
        // Update movement animation progress
        if (animationState.isAnimating) {
            setAnimationState(prev => {
                const newProgress = prev.progress + (delta / prev.duration);
                
                if (newProgress >= 1) {
                    // Animation complete
                    return {
                        ...prev,
                        isAnimating: false,
                        progress: 1
                    };
                }
                
                return {
                    ...prev,
                    progress: newProgress
                };
            });
        }

        if (meshRef.current) {
            const time = state.clock.elapsedTime;
            
            // Update position to current animated position
            meshRef.current.position.set(worldPosition[0], worldPosition[1], worldPosition[2]);
            
            // Current player pulse animation (only when not moving)
            if (isCurrentPlayer && gamePhase === 'playing' && !animationState.isAnimating) {
                const pulse = Math.sin(time * 4) * 0.1 + 1;
                meshRef.current.scale.setScalar(pulse);
            } else {
                meshRef.current.scale.setScalar(1);
            }
            
            // Rotation animation when hovered
            if (isHovered) {
                meshRef.current.rotation.y = time * 2;
            } else {
                meshRef.current.rotation.y = 0;
            }
        }

        // Glow effect animation
        if (glowRef.current) {
            const time = state.clock.elapsedTime;
            const glowIntensity = isCurrentPlayer 
                ? Math.sin(time * 3) * 0.3 + 0.7
                : 0.3;
            
            (glowRef.current.material as THREE.MeshBasicMaterial).opacity = glowIntensity;
        }
    });

    return (
        <group name={`player-${player.id}`}>
            {/* Glow effect ring */}
            <mesh
                ref={glowRef}
                position={[0, -0.4, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
            >
                <ringGeometry args={[0.8, 1.2, 32]} />
                <meshBasicMaterial
                    color={colors.glow}
                    transparent
                    opacity={0.3}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Shadow circle */}
            <mesh position={[0, -0.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.7, 32]} />
                <meshBasicMaterial
                    color={0x000000}
                    transparent
                    opacity={0.2}
                />
            </mesh>

            {/* GLTF Pawn Model */}
            <group
                ref={meshRef}
                castShadow
                receiveShadow
                onPointerEnter={() => setIsHovered(true)}
                onPointerLeave={() => setIsHovered(false)}
            >
                {player.color === 'blue' ? <CornCharacter /> : <SmokingCharacter />}
            </group>

            {/* Player ID text */}
            <Text
                position={[0, 1.4, 0]}
                rotation={[0, 0, 0]}
                fontSize={0.4}
                color="white"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="black"
            >
                {player.id}
            </Text>

            {/* AI indicator */}
            {player.isAI && (
                <Text
                    position={[0, -0.8, 0]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    fontSize={0.3}
                    color={colors.main}
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.01}
                    outlineColor="white"
                >
                    AI
                </Text>
            )}

            {/* Walls remaining indicator */}
            <group position={[0, -1.2, 0]}>
                {Array.from({ length: Math.min(player.wallsLeft, 10) }, (_, i) => (
                    <mesh
                        key={i}
                        position={[
                            (i - 4.5) * 0.15,
                            0,
                            0
                        ]}
                        rotation={[-Math.PI / 2, 0, 0]}
                    >
                        <planeGeometry args={[0.1, 0.3]} />
                        <meshBasicMaterial
                            color={colors.main}
                            transparent
                            opacity={0.6}
                        />
                    </mesh>
                ))}
                
                {/* Additional walls count if more than 10 */}
                {player.wallsLeft > 10 && (
                    <Text
                        position={[0, 0, 0.2]}
                        rotation={[-Math.PI / 2, 0, 0]}
                        fontSize={0.2}
                        color={colors.main}
                        anchorX="center"
                        anchorY="middle"
                    >
                        +{player.wallsLeft - 10}
                    </Text>
                )}
            </group>

            {/* Hover information */}
            {isHovered && (
                <group position={[0, 2, 0]}>
                    <mesh>
                        <planeGeometry args={[3, 1]} />
                        <meshBasicMaterial
                            color={0x000000}
                            transparent
                            opacity={0.7}
                        />
                    </mesh>
                    <Text
                        position={[0, 0.1, 0.01]}
                        fontSize={0.3}
                        color="white"
                        anchorX="center"
                        anchorY="middle"
                    >
                        Player {player.id} {player.isAI ? '(AI)' : ''}
                    </Text>
                    <Text
                        position={[0, -0.2, 0.01]}
                        fontSize={0.2}
                        color="white"
                        anchorX="center"
                        anchorY="middle"
                    >
                        Walls: {player.wallsLeft}
                    </Text>
                </group>
            )}

            {/* Particle effects for movement (placeholder) */}
            {/* TODO: Add particle system for movement trails */}
        </group>
    );
};