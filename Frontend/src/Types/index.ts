// Re-export all types for easy importing
export * from './GameTypes';
export * from './UserTypes';

// Application State Types
export interface AppState {
  auth: import('./UserTypes').AuthState;
  game: import('./GameTypes').GameState;
  ui: import('./GameTypes').UIState;
  shop: import('./UserTypes').ShopState;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

// Form Types
export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Loading States
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  progress?: number;
}

// Settings Types
export interface GameSettings {
  boardSize: number;
  aiLevel: import('./GameTypes').AILevel;
  soundEnabled: boolean;
  musicEnabled: boolean;
  showAnimations: boolean;
  cameraSpeed: number;
  graphicsQuality: 'low' | 'medium' | 'high';
}

// Error Types
export interface GameError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface ErrorReport {
  id: string;
  severity: ErrorSeverity;
  error: GameError;
  context: {
    userId?: string;
    gameState?: Partial<import('./GameTypes').GameState>;
    userAgent: string;
    url: string;
  };
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Event Handler Types
export type GameEventHandler<T = any> = (event: import('./GameTypes').GameEvent, data?: T) => void;
export type UIEventHandler<T = React.SyntheticEvent> = (event: T) => void;