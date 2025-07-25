import React, { useRef, useState, useEffect } from 'react';
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
    const meshRef = useRef<THREE.Mesh>(null);
    const glowRef = useRef<THREE.Mesh>(null);
    const [isHovered, setIsHovered] = useState(false);

    // Calculate world position from grid position
    const worldPosition: [number, number, number] = [
        constants.BOARD_OFFSET + player.position.x * constants.CELL_SIZE,
        constants.CUBE_HEIGHT + 0.3,
        constants.BOARD_OFFSET + player.position.y * constants.CELL_SIZE
    ];

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
    useFrame((state) => {
        if (meshRef.current) {
            const time = state.clock.elapsedTime;
            
            // Gentle floating animation
            meshRef.current.position.y = worldPosition[1] + Math.sin(time * 2 + player.id) * 0.1;
            
            // Current player pulse animation
            if (isCurrentPlayer && gamePhase === 'playing') {
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
        <group name={`player-${player.id}`} position={worldPosition}>
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

            {/* Main pawn body */}
            <mesh
                ref={meshRef}
                castShadow
                receiveShadow
                onPointerEnter={() => setIsHovered(true)}
                onPointerLeave={() => setIsHovered(false)}
            >
                <cylinderGeometry args={[0.4, 0.5, 0.8, 16]} />
                <meshPhysicalMaterial
                    color={colors.main}
                    emissive={colors.emissive}
                    emissiveIntensity={isCurrentPlayer ? 0.3 : 0.1}
                    roughness={0.3}
                    metalness={0.1}
                    clearcoat={0.8}
                    clearcoatRoughness={0.2}
                />
            </mesh>

            {/* Pawn head */}
            <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
                <sphereGeometry args={[0.35, 16, 16]} />
                <meshPhysicalMaterial
                    color={colors.main}
                    emissive={colors.emissive}
                    emissiveIntensity={isCurrentPlayer ? 0.3 : 0.1}
                    roughness={0.2}
                    metalness={0.1}
                    clearcoat={0.9}
                    clearcoatRoughness={0.1}
                />
            </mesh>

            {/* Player indicator crown */}
            {isCurrentPlayer && gamePhase === 'playing' && (
                <mesh position={[0, 1.1, 0]} castShadow>
                    <coneGeometry args={[0.2, 0.3, 8]} />
                    <meshPhysicalMaterial
                        color={0xffd700}
                        emissive={0xffaa00}
                        emissiveIntensity={0.5}
                        roughness={0.1}
                        metalness={0.8}
                    />
                </mesh>
            )}

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