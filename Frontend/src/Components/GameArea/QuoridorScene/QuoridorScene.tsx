import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing';
import { BlendFunction, KernelSize, Resolution } from 'postprocessing';
import * as THREE from 'three';
import { GameState, GameSettings } from '../../../Types';
import { GameBoard } from '../GameBoard/GameBoard';
import { GamePawn } from '../GamePawn/GamePawn';
import { GameWall } from '../GameWall/GameWall';
import { LightingSystem } from '../LightingSystem/LightingSystem';
import { getGameConstants } from '../../../Utils/GameLogic';

interface QuoridorSceneProps {
    gameState: GameState;
    gameSettings: GameSettings;
    onCellClick?: (x: number, y: number) => void;
    onWallClick?: (x: number, y: number, orientation: 'horizontal' | 'vertical') => void;
}

export const QuoridorScene: React.FC<QuoridorSceneProps> = ({
    gameState,
    gameSettings,
    onCellClick,
    onWallClick
}) => {
    const constants = useMemo(() => getGameConstants(gameState.boardSize), [gameState.boardSize]);
    
    // Camera configuration - matches original positioning
    const cameraPosition = useMemo(() => {
        return [-10, 15, 15] as [number, number, number];
    }, []);

    // Post-processing effects - matches original exactly with minimal bloom to prevent blur
    const PostProcessing = () => (
        <EffectComposer>
            <Bloom
                blendFunction={BlendFunction.ADD}
                intensity={0.2}  // Original: bloomPass.strength = 0.2
                width={Resolution.AUTO_SIZE}
                height={Resolution.AUTO_SIZE}
                kernelSize={KernelSize.SMALL}  // Small radius to keep things sharp
                luminanceThreshold={0.4}  // Original: bloomPass.threshold = 0.4
                luminanceSmoothing={0.4}  // Matches original 0.4 setting
                radius={0.25}  // Original: bloomPass.radius = 0.25
            />
        </EffectComposer>
    );

    return (
        <Canvas
            shadows
            gl={{
                antialias: true,
                alpha: false,
                powerPreference: 'high-performance',
                stencil: false,
                depth: true
            }}
            camera={{ position: cameraPosition, fov: 50 }}
            onCreated={({ gl, scene, camera }) => {
                // Configure renderer - matches original exactly
                gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                gl.shadowMap.enabled = true;
                gl.shadowMap.type = THREE.PCFSoftShadowMap;
                gl.toneMapping = THREE.ACESFilmicToneMapping;
                gl.toneMappingExposure = 1.0;
                gl.outputColorSpace = THREE.SRGBColorSpace;
            }}
        >
            {/* Camera and Controls - matches original setup */}
            <PerspectiveCamera makeDefault position={cameraPosition} fov={50} />
            <OrbitControls
                target={[0, 2, 0]}
                maxPolarAngle={Math.PI / 2 - 0.05}
                minDistance={8}  // Original: window.controls.minDistance = 8
                maxDistance={30}  // Original: window.controls.maxDistance = 30
                enableDamping={true}
                dampingFactor={0.05}
                enablePan={true}
                rotateSpeed={0.5}
                zoomSpeed={0.8}  // Original: window.controls.zoomSpeed = 0.8
            />

            {/* Advanced Lighting System */}
            <LightingSystem gameState={gameState} />

            {/* Game Objects */}
            <group>
                {/* Sophisticated Game Board */}
                <GameBoard
                    boardSize={gameState.boardSize}
                    constants={constants}
                    gameSettings={gameSettings}
                    gameState={gameState}
                    onCellClick={onCellClick}
                    onWallClick={onWallClick}
                />

                {/* Players with smoke effects */}
                {Object.entries(gameState.players).map(([playerId, player]) => (
                    <GamePawn
                        key={`player-${playerId}`}
                        player={player}
                        constants={constants}
                        isCurrentPlayer={gameState.currentPlayer === player.id}
                        gamePhase={gameState.phase}
                    />
                ))}

                {/* Walls */}
                {gameState.walls.map((wall) => (
                    <GameWall
                        key={wall.id}
                        wall={wall}
                        constants={constants}
                        gameSettings={gameSettings}
                    />
                ))}
            </group>

            {/* Post-processing effects - controlled bloom to prevent blur */}
            {gameSettings.graphicsQuality !== 'low' && <PostProcessing />}
        </Canvas>
    );
};