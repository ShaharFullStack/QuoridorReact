import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Wall, GameConstants, GameSettings } from '../../../Types';
import { materialFactory } from '../../../Utils/MaterialsSystem';

interface GameWallProps {
    wall: Wall;
    constants: GameConstants;
    gameSettings: GameSettings;
}

export const GameWall: React.FC<GameWallProps> = ({
    wall,
    constants,
    gameSettings
}) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [wallMaterial, setWallMaterial] = useState<THREE.MeshPhysicalMaterial | null>(null);
    const [isHovered, setIsHovered] = useState(false);

    // Initialize wall material
    React.useEffect(() => {
        const initMaterial = async () => {
            try {
                // Use the exact wall material configuration from original game
                const loader = new THREE.TextureLoader();
                
                const albedo = loader.load('/assets/textures/black-white-tile-bl/black-white-tile_albedo.png');
                const normal = loader.load('/assets/textures/black-white-tile-bl/black-white-tile_normal-ogl.png');
                const roughness = loader.load('/assets/textures/black-white-tile-bl/black-white-tile_roughness.png');
                
                // Configure texture wrapping and repeat (matching original exactly)
                [albedo, normal, roughness].forEach(tex => {
                    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
                    tex.repeat.set(0.33, 0.15); // Original wall texture repeat values
                });

                const material = new THREE.MeshPhysicalMaterial({
                    map: albedo,
                    normalMap: normal,
                    roughnessMap: roughness,
                    roughness: 1.0,
                    metalness: 0.5,
                    color: 0xffffff,
                    clearcoat: 0.7,
                    clearcoatRoughness: 0.15,
                    emissive: 0x0f172a,
                    emissiveIntensity: 0.5,
                });

                setWallMaterial(material);
            } catch (error) {
                console.warn('Failed to load wall material, using fallback:', error);
                // Fallback material
                setWallMaterial(new THREE.MeshPhysicalMaterial({
                    color: 0x34495e,
                    roughness: 0.9,
                    metalness: 0.1
                }));
            }
        };

        initMaterial();
    }, []);

    // Calculate wall position and dimensions
    const { position, dimensions, rotation } = React.useMemo(() => {
        const isHorizontal = wall.position.orientation === 'horizontal';
        
        // Center wall between cells it blocks
        const worldX = constants.BOARD_OFFSET + wall.position.x * constants.CELL_SIZE + constants.CELL_SIZE / 2;
        const worldZ = constants.BOARD_OFFSET + wall.position.y * constants.CELL_SIZE + constants.CELL_SIZE / 2;
        
        const pos: [number, number, number] = [
            worldX,
            constants.WALL_HEIGHT / 2,
            worldZ
        ];

        const dims: [number, number, number] = isHorizontal
            ? [constants.CELL_SIZE * 2, constants.WALL_HEIGHT, constants.WALL_WIDTH]
            : [constants.WALL_WIDTH, constants.WALL_HEIGHT, constants.CELL_SIZE * 2];

        const rot: [number, number, number] = [0, 0, 0];

        return { position: pos, dimensions: dims, rotation: rot };
    }, [wall.position, constants]);

    // Player colors for wall ownership indication
    const playerColors = {
        1: { main: 0x3498db, emissive: 0x1e5f99 },
        2: { main: 0xe74c3c, emissive: 0x99321e }
    };

    const playerColor = playerColors[wall.playerId];

    // Animation effects
    useFrame((state) => {
        if (meshRef.current && gameSettings.showAnimations) {
            const time = state.clock.elapsedTime;
            
            // Subtle wall breathing animation
            const breathe = Math.sin(time * 0.8 + wall.playerId) * 0.02 + 1;
            meshRef.current.scale.y = breathe;
            
            // Hover effect
            if (isHovered) {
                meshRef.current.position.y = position[1] + Math.sin(time * 6) * 0.1;
            } else {
                meshRef.current.position.y = position[1];
            }
        }
    });

    if (!wallMaterial) {
        return null; // Still loading material
    }

    return (
        <group name={`wall-${wall.id}`}>
            {/* Main wall body */}
            <mesh
                ref={meshRef}
                position={position}
                rotation={rotation}
                castShadow
                receiveShadow
                onPointerEnter={() => setIsHovered(true)}
                onPointerLeave={() => setIsHovered(false)}
            >
                <boxGeometry args={dimensions} />
                <meshPhysicalMaterial
                    {...wallMaterial}
                    color={isHovered ? 0xffffff : wallMaterial.color}
                    emissive={playerColor.emissive}
                    emissiveIntensity={isHovered ? 0.3 : 0.1}
                />
            </mesh>

            {/* Player ownership indicator - colored strip at the top */}
            <mesh
                position={[
                    position[0],
                    position[1] + dimensions[1] / 2 + 0.02,
                    position[2]
                ]}
                rotation={rotation}
                castShadow
            >
                <boxGeometry args={[
                    dimensions[0],
                    0.1,
                    dimensions[2]
                ]} />
                <meshPhysicalMaterial
                    color={playerColor.main}
                    emissive={playerColor.emissive}
                    emissiveIntensity={0.4}
                    roughness={0.3}
                    metalness={0.2}
                />
            </mesh>

            {/* Base/foundation */}
            <mesh
                position={[
                    position[0],
                    0.05,
                    position[2]
                ]}
                rotation={rotation}
                receiveShadow
            >
                <boxGeometry args={[
                    dimensions[0] + 0.1,
                    0.1,
                    dimensions[2] + 0.1
                ]} />
                <meshPhysicalMaterial
                    color={0x2c3e50}
                    roughness={0.8}
                    metalness={0.1}
                />
            </mesh>

            {/* Decorative elements */}
            {gameSettings.graphicsQuality === 'high' && (
                <>
                    {/* Corner posts */}
                    {wall.position.orientation === 'horizontal' ? (
                        <>
                            <mesh
                                position={[
                                    position[0] - dimensions[0] / 2 + 0.1,
                                    position[1],
                                    position[2]
                                ]}
                                castShadow
                            >
                                <cylinderGeometry args={[0.08, 0.08, dimensions[1], 8]} />
                                <meshPhysicalMaterial
                                    color={0x34495e}
                                    roughness={0.4}
                                    metalness={0.6}
                                />
                            </mesh>
                            <mesh
                                position={[
                                    position[0] + dimensions[0] / 2 - 0.1,
                                    position[1],
                                    position[2]
                                ]}
                                castShadow
                            >
                                <cylinderGeometry args={[0.08, 0.08, dimensions[1], 8]} />
                                <meshPhysicalMaterial
                                    color={0x34495e}
                                    roughness={0.4}
                                    metalness={0.6}
                                />
                            </mesh>
                        </>
                    ) : (
                        <>
                            <mesh
                                position={[
                                    position[0],
                                    position[1],
                                    position[2] - dimensions[2] / 2 + 0.1
                                ]}
                                castShadow
                            >
                                <cylinderGeometry args={[0.08, 0.08, dimensions[1], 8]} />
                                <meshPhysicalMaterial
                                    color={0x34495e}
                                    roughness={0.4}
                                    metalness={0.6}
                                />
                            </mesh>
                            <mesh
                                position={[
                                    position[0],
                                    position[1],
                                    position[2] + dimensions[2] / 2 - 0.1
                                ]}
                                castShadow
                            >
                                <cylinderGeometry args={[0.08, 0.08, dimensions[1], 8]} />
                                <meshPhysicalMaterial
                                    color={0x34495e}
                                    roughness={0.4}
                                    metalness={0.6}
                                />
                            </mesh>
                        </>
                    )}
                </>
            )}

            {/* Glow effect for recently placed walls */}
            {/* TODO: Add timestamp-based glow for newly placed walls */}
            
            {/* Particle effects */}
            {/* TODO: Add particle system for wall placement animation */}
        </group>
    );
};