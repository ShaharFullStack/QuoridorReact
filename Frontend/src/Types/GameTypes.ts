import * as THREE from 'three';

// Game Constants
export interface GameConstants {
  BOARD_SIZE: number;
  WALLS_PER_PLAYER: number;
  CELL_SIZE: number;
  CUBE_HEIGHT: number;
  CUBE_GAP: number;
  WALL_WIDTH: number;
  WALL_HEIGHT: number;
  BOARD_OFFSET: number;
}

// Player Types
export type PlayerId = 1 | 2;
export type PlayerColor = 'blue' | 'red';

export interface PlayerPosition {
  x: number;
  y: number;
}

export interface Player {
  id: PlayerId;
  color: PlayerColor;
  position: PlayerPosition;
  wallsLeft: number;
  isAI: boolean;
}

// Wall Types
export type WallOrientation = 'horizontal' | 'vertical';

export interface WallPosition {
  x: number;
  y: number;
  orientation: WallOrientation;
}

export interface Wall {
  id: string;
  position: WallPosition;
  playerId: PlayerId;
}

// Game State Types
export type GamePhase = 'waiting' | 'playing' | 'finished' | 'paused';
export type GameMode = 'pvp' | 'pvc'; // Player vs Player or Player vs Computer
export type AILevel = 'easy' | 'medium' | 'hard';

export interface GameState {
  phase: GamePhase;
  mode: GameMode;
  aiLevel: AILevel;
  currentPlayer: PlayerId;
  players: Record<PlayerId, Player>;
  walls: Wall[];
  winner: PlayerId | null;
  moveHistory: GameMove[];
  boardSize: number; // Progressive difficulty: 5, 7, 9, 11
}

// Move Types
export type MoveType = 'move' | 'wall';

export interface PlayerMove {
  type: 'move';
  playerId: PlayerId;
  from: PlayerPosition;
  to: PlayerPosition;
}

export interface WallMove {
  type: 'wall';
  playerId: PlayerId;
  position: WallPosition;
}

export type GameMove = PlayerMove | WallMove;

// 3D Scene Types
export interface SceneObjects {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: any; // OrbitControls
  raycaster: THREE.Raycaster;
  mouse: THREE.Vector2;
  boardGroup: THREE.Group;
  pawns: Record<PlayerId, THREE.Mesh>;
  wallsGroup: THREE.Group;
  cellMeshes: THREE.Mesh[];
  hWallPlanes: THREE.Mesh[];
  vWallPlanes: THREE.Mesh[];
  hoveredObject: THREE.Object3D | null;
  playerSpotlights: Record<PlayerId, THREE.SpotLight>;
}

// Material Types
export interface MaterialTextures {
  albedo?: THREE.Texture;
  normal?: THREE.Texture;
  ao?: THREE.Texture;
  roughness?: THREE.Texture;
  metallic?: THREE.Texture;
  height?: THREE.Texture;
}

export interface GameMaterials {
  board: THREE.MeshPhysicalMaterial;
  wall: THREE.MeshPhysicalMaterial;
  goal: THREE.MeshPhysicalMaterial;
  player1: THREE.MeshPhysicalMaterial;
  player2: THREE.MeshPhysicalMaterial;
}

// Animation Types
export interface SmokeUpdater {
  update: (deltaTime: number) => void;
  dispose: () => void;
}

// UI State Types
export interface UIState {
  isMenuOpen: boolean;
  showSettings: boolean;
  showHelp: boolean;
  selectedLanguage: string;
  showMoveHistory: boolean;
  gameMessage: string | null;
}

// Game Events
export type GameEventType = 
  | 'player-move' 
  | 'wall-place' 
  | 'game-start' 
  | 'game-end' 
  | 'player-turn-change'
  | 'ai-thinking-start'
  | 'ai-thinking-end';

export interface GameEvent {
  type: GameEventType;
  playerId?: PlayerId;
  data?: any;
  timestamp: number;
}

// Validation Types
export interface MoveValidation {
  isValid: boolean;
  reason?: string;
  validMoves?: PlayerPosition[];
}

export interface WallValidation {
  isValid: boolean;
  reason?: string;
  blocksPath?: boolean;
}