// User Authentication Types
export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar?: string;
  level: number;
  experience: number;
  coins: number;
  diamonds: number;
  createdAt: Date;
  lastLogin: Date;
  preferences: UserPreferences;
  statistics: UserStatistics;
}

export interface UserPreferences {
  language: string;
  soundEnabled: boolean;
  musicEnabled: boolean;
  graphicsQuality: 'low' | 'medium' | 'high';
  cameraSpeed: number;
  showAnimations: boolean;
  selectedSkins: UserSkins;
}

export interface UserSkins {
  boardTexture: string;
  wallTexture: string;
  goalTexture: string;
  playerSkin: string;
}

export interface UserStatistics {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  winRate: number;
  averageGameTime: number;
  bestTime: number;
  totalPlayTime: number;
  favoriteGameMode: string;
  highestLevelReached: number;
  perfectGames: number; // Games won without losing walls
  longestWinStreak: number;
  currentWinStreak: number;
}

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Currency System Types
export type CurrencyType = 'coins' | 'diamonds';

export interface CurrencyTransaction {
  id: string;
  userId: string;
  type: CurrencyType;
  amount: number;
  operation: 'earn' | 'spend';
  reason: string;
  timestamp: Date;
  details?: {
    gameId?: string;
    purchaseId?: string;
    achievementId?: string;
    missionId?: string;
  };
}

export interface CurrencyBalance {
  coins: number;
  diamonds: number;
  lastUpdated: Date;
}

// Reward System Types
export interface Reward {
  id: string;
  type: CurrencyType;
  amount: number;
  reason: string;
  category: 'game' | 'achievement' | 'mission' | 'daily' | 'purchase';
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  requirements: MissionRequirement[];
  rewards: Reward[];
  progress: number;
  maxProgress: number;
  isCompleted: boolean;
  expiresAt?: Date;
}

export interface MissionRequirement {
  type: 'win_games' | 'play_games' | 'win_streak' | 'perfect_game' | 'play_mode' | 'use_skin';
  target: number | string;
  current: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'gameplay' | 'progression' | 'collection' | 'special';
  requirements: AchievementRequirement[];
  rewards: Reward[];
  isUnlocked: boolean;
  unlockedAt?: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface AchievementRequirement {
  type: 'games_won' | 'level_reached' | 'perfect_games' | 'win_streak' | 'total_playtime';
  value: number;
}

// Shop System Types
export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: 'board' | 'wall' | 'goal' | 'player' | 'effect';
  type: CurrencyType;
  price: number;
  originalPrice?: number; // For sales
  isOnSale: boolean;
  saleEndDate?: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  previewImage: string;
  texturePath?: string;
  modelPath?: string;
  isOwned: boolean;
  isEquipped: boolean;
  unlockRequirements?: {
    level?: number;
    achievements?: string[];
    missions?: string[];
  };
}

export interface Purchase {
  id: string;
  userId: string;
  itemId: string;
  price: number;
  currencyType: CurrencyType;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
}

export interface ShopState {
  items: ShopItem[];
  categories: string[];
  selectedCategory: string;
  isLoading: boolean;
  error: string | null;
}

// Leaderboard Types
export interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    username: string;
    avatar?: string;
    level: number;
  };
  score: number;
  gamesWon: number;
  winRate: number;
  currentStreak: number;
}

export interface Leaderboard {
  type: 'global' | 'weekly' | 'monthly' | 'friends';
  entries: LeaderboardEntry[];
  userRank?: number;
  lastUpdated: Date;
}

// Progress System Types
export interface LevelProgression {
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXPForCurrentLevel: number;
  progressPercentage: number;
}

export interface XPReward {
  amount: number;
  reason: string;
  multiplier?: number;
}