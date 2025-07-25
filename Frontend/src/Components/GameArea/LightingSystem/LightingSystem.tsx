import React, { useMemo } from 'react';
import * as THREE from 'three';
import { GameState } from '../../../Types';
import { getGameConstants } from '../../../Utils/GameLogic';

interface LightingSystemProps {
  gameState: GameState;
}

/**
 * Advanced Lighting System Component
 * Matches the sophisticated lighting setup from the original vanilla JS implementation
 */
export const LightingSystem: React.FC<LightingSystemProps> = ({ gameState }) => {
  const constants = useMemo(() => getGameConstants(gameState.boardSize), [gameState.boardSize]);

  // Sky background color
  const skyColor = useMemo(() => new THREE.Color(0x87ceeb), []);

  // Player spotlight positions (exactly like original with offsets)
  const player1SpotlightData = useMemo(() => {
    const player1 = gameState.players[1];
    const targetX = constants.BOARD_OFFSET + player1.position.x * constants.CELL_SIZE;
    const targetZ = constants.BOARD_OFFSET + player1.position.y * constants.CELL_SIZE;
    const playerHeight = constants.CUBE_HEIGHT + 1.5 - 1; // Original formula
    
    return {
      position: [targetX + 2, 15, targetZ + 4] as [number, number, number], // Original offset
      target: [targetX, playerHeight, targetZ] as [number, number, number]
    };
  }, [gameState.players, constants]);

  const player2SpotlightData = useMemo(() => {
    const player2 = gameState.players[2];
    const targetX = constants.BOARD_OFFSET + player2.position.x * constants.CELL_SIZE;
    const targetZ = constants.BOARD_OFFSET + player2.position.y * constants.CELL_SIZE;
    const playerHeight = constants.CUBE_HEIGHT + 1.5 - 1; // Original formula
    
    return {
      position: [targetX - 2, 15, targetZ - 4] as [number, number, number], // Original offset
      target: [targetX, playerHeight, targetZ] as [number, number, number]
    };
  }, [gameState.players, constants]);

  return (
    <>
      {/* Sky background */}
      <color attach="background" args={[skyColor]} />
      <fog attach="fog" args={[skyColor, 25, 70]} />

      {/* Main directional light with shadows - matches original exactly */}
      <directionalLight
        position={[12, 30, 10]}
        intensity={1.5}
        color={0xffffff}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.1}
        shadow-camera-far={100}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.0005}
      />

      {/* Hemisphere light for realistic sky/ground lighting */}
      <hemisphereLight
        color={0x87CEEB}
        groundColor={0x1f2937}
        intensity={0.4}
      />

      {/* Fill light for softer shadows */}
      <directionalLight
        position={[-10, 15, -10]}
        intensity={0.5}
        color={0xaabbcc}
      />

      {/* Player 1 spotlight (Blue) - follows player position with exact original positioning */}
      <spotLight
        position={player1SpotlightData.position}
        target-position={player1SpotlightData.target}
        intensity={2.5}
        color={0x6699ff}
        distance={20}
        angle={Math.PI / 5}
        penumbra={0.2}
        decay={1.5}
        castShadow
      />

      {/* Player 2 spotlight (Pink/Red) - follows player position with exact original positioning */}
      <spotLight
        position={player2SpotlightData.position}
        target-position={player2SpotlightData.target}
        intensity={2.5}
        color={0xff6699}
        distance={20}
        angle={Math.PI / 5}
        penumbra={0.2}
        decay={1.5}
        castShadow
      />

      {/* Skybox sphere for distant background */}
      <mesh>
        <sphereGeometry args={[500, 32, 32]} />
        <meshBasicMaterial
          color={skyColor}
          side={THREE.BackSide}
          fog={false}
        />
      </mesh>
    </>
  );
};

export default LightingSystem;