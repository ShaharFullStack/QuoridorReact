import React, { ReactElement } from 'react';
import { render, RenderOptions, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import { userSlice } from '../Redux/UserSlice';
import { UserModel } from '../Models/UserModel';

// Create a custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: {
    user?: UserModel | null;
  };
  route?: string;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {},
    route = '/',
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  // Create a test store
  const store = configureStore({
    reducer: {
      user: userSlice.reducer,
    },
    preloadedState,
  });

  // Create wrapper with all providers
  function Wrapper({ children }: { children?: React.ReactNode }) {
    // Set initial route
    window.history.pushState({}, 'Test page', route);
    
    return (
      <Provider store={store}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </Provider>
    );
  }

  // Return an object with the store and all of RTL's query functions
  return {
    store,
    user: userEvent,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

// Mock user data for testing
export const mockUsers = {
  regularUser: {
    id: 'user-1',
    username: 'testuser',
    email: 'test@example.com',
    displayName: 'Test User',
    firstName: 'Test',
    lastName: 'User',
    password: 'password123',
    roleId: 1,
    level: 5,
    experience: 1250,
    coins: 500,
    diamonds: 10,
    preferences: {
      language: 'en',
      graphicsQuality: 'high' as const,
      soundEnabled: true,
      musicEnabled: true,
      showAnimations: true,
      selectedSkin: 'default',
    },
    statistics: {
      gamesPlayed: 25,
      gamesWon: 15,
      winRate: 0.6,
      currentStreak: 3,
      bestStreak: 7,
      averageGameTime: 8.5,
      totalPlayTime: 180,
    },
  } as UserModel,
  
  premiumUser: {
    id: 'user-2',
    username: 'premiumuser',
    email: 'premium@example.com',
    displayName: 'Premium User',
    firstName: 'Premium',
    lastName: 'User',
    password: 'securepassword',
    roleId: 2,
    level: 15,
    experience: 5000,
    coins: 2000,
    diamonds: 50,
    preferences: {
      language: 'en',
      graphicsQuality: 'ultra' as const,
      soundEnabled: true,
      musicEnabled: true,
      showAnimations: true,
      selectedSkin: 'golden',
    },
    statistics: {
      gamesPlayed: 100,
      gamesWon: 75,
      winRate: 0.75,
      currentStreak: 10,
      bestStreak: 15,
      averageGameTime: 6.2,
      totalPlayTime: 600,
    },
  } as UserModel,
};

// Game state mocks
export const mockGameState = {
  basic: {
    phase: 'playing' as const,
    mode: 'pvp' as const,
    aiLevel: 'medium' as const,
    currentPlayer: 1 as const,
    players: {
      1: {
        id: 1 as const,
        color: 'blue' as const,
        position: { x: 4, y: 0 },
        wallsLeft: 10,
        isAI: false,
        isMoving: false,
      },
      2: {
        id: 2 as const,
        color: 'red' as const,
        position: { x: 4, y: 8 },
        wallsLeft: 10,
        isAI: false,
        isMoving: false,
      },
    }, 
    walls: [] as { x: number; y: number; orientation: 'horizontal' | 'vertical' }[],
    winner: null as number | null,
    moveHistory: [] as { x: number; y: number }[],
    boardSize: 9,
    gameMode: 'move' as const,
    validMoves: [
      { x: 3, y: 0 },
      { x: 4, y: 1 },
      { x: 5, y: 0 },
    ],
    wallPlacementStage: 1 as const,
    firstWallSegment: null as { x: number; y: number; orientation: 'horizontal' | 'vertical' } | null,
  },
};

// Custom matchers for game testing
export const customMatchers = {
  toBeValidPosition: (position: { x: number; y: number }, boardSize: number = 9) => {
    const isValid = position.x >= 0 && position.x < boardSize && 
                   position.y >= 0 && position.y < boardSize;
    return {
      pass: isValid,
      message: () => 
        `Expected position (${position.x}, ${position.y}) to be ${isValid ? 'invalid' : 'valid'} for board size ${boardSize}`
    };
  },
  
  toBeWithinBoard: (positions: { x: number; y: number }[], boardSize: number = 9) => {
    const allValid = positions.every(pos => 
      pos.x >= 0 && pos.x < boardSize && pos.y >= 0 && pos.y < boardSize
    );
    return {
      pass: allValid,
      message: () => 
        `Expected all positions to be within board bounds (0-${boardSize-1})`
    };
  },
};

// Helper functions for testing
export const testHelpers = {
  // Wait for loading to complete
  waitForLoadingToFinish: async () => {
    await screen.findByText(/loading/i, {}, { timeout: 3000 });
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  },
  
  // Get element with better error messages
  getByTestId: (testId: string) => {
    const element = screen.getByTestId(testId);
    if (!element) {
      throw new Error(`Element with test-id "${testId}" not found. Available test-ids: ${
        Array.from(document.querySelectorAll('[data-testid]'))
          .map(el => el.getAttribute('data-testid'))
          .join(', ')
      }`);
    }
    return element;
  },
  
  // Accessibility helpers
  expectToBeAccessible: async (container: HTMLElement) => {
    // Check for basic accessibility requirements
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const images = container.querySelectorAll('img');
    const buttons = container.querySelectorAll('button');
    const links = container.querySelectorAll('a');
    
    // Check images have alt text
    images.forEach(img => {
      expect(img).toHaveAttribute('alt');
    });
    
    // Check buttons have accessible names
    buttons.forEach(button => {
      const hasAccessibleName = 
        button.textContent?.trim() ||
        button.getAttribute('aria-label') ||
        button.getAttribute('aria-labelledby');
      expect(hasAccessibleName).toBeTruthy();
    });
    
    // Check links have accessible names
    links.forEach(link => {
      const hasAccessibleName = 
        link.textContent?.trim() ||
        link.getAttribute('aria-label') ||
        link.getAttribute('aria-labelledby');
      expect(hasAccessibleName).toBeTruthy();
    });
  },
  
  // Keyboard navigation testing
  testKeyboardNavigation: async (user: typeof userEvent) => {
    // Test tab navigation
    await user.tab();
    expect(document.activeElement).not.toBe(document.body);
    
    // Test escape key
    await user.keyboard('{Escape}');
    
    // Test enter key on focused element
    if (document.activeElement && 
        (document.activeElement.tagName === 'BUTTON' || 
         document.activeElement.tagName === 'A')) {
      await user.keyboard('{Enter}');
    }
  },
  
  // Responsive testing helpers
  mockViewport: (width: number, height: number = 768) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height,
    });
    window.dispatchEvent(new Event('resize'));
  },
  
  // Game testing helpers
  expectGameStateValid: (gameState: typeof mockGameState.basic) => {
    expect(gameState.players[1]).toBeDefined();
    expect(gameState.players[2]).toBeDefined();
    expect(gameState.boardSize).toBeGreaterThan(0);
    expect(['playing', 'finished', 'waiting', 'paused']).toContain(gameState.phase);
    expect(['pvp', 'pvc']).toContain(gameState.mode);
    expect([1, 2]).toContain(gameState.currentPlayer);
  },
};

// Mock implementations for external dependencies
export const mocks = {
  // Mock Three.js for component testing
  mockThree: () => {
    jest.mock('three', () => ({
      Scene: jest.fn(() => ({
        add: jest.fn(),
        remove: jest.fn(),
      })),
      PerspectiveCamera: jest.fn(),
      WebGLRenderer: jest.fn(() => ({
        setSize: jest.fn(),
        render: jest.fn(),
        domElement: document.createElement('canvas'),
      })),
      Vector2: jest.fn(),
      Raycaster: jest.fn(),
      Group: jest.fn(() => ({
        add: jest.fn(),
        remove: jest.fn(),
      })),
      Mesh: jest.fn(),
      BoxGeometry: jest.fn(),
      MeshPhysicalMaterial: jest.fn(),
    }));
  },
  
  // Mock React Three Fiber
  mockR3F: () => {
    jest.mock('@react-three/fiber', () => ({
      Canvas: ({ children, ...props }: any) => 
        React.createElement('div', { 'data-testid': 'r3f-canvas', ...props }, children),
      useFrame: jest.fn(),
      useThree: jest.fn(() => ({
        scene: {},
        camera: {},
        renderer: {},
      })),
    }));
  },
  
  // Mock localStorage
  mockLocalStorage: () => {
    const mockStorage: { [key: string]: string } = {};
    
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key: string) => mockStorage[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          mockStorage[key] = value.toString();
        }),
        removeItem: jest.fn((key: string) => {
          delete mockStorage[key];
        }),
        clear: jest.fn(() => {
          Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
        }),
        length: Object.keys(mockStorage).length,
        key: jest.fn((index: number) => Object.keys(mockStorage)[index] || null),
      },
      writable: true,
    });
    
    return mockStorage;
  },
  
  // Mock window.matchMedia for responsive testing
  mockMatchMedia: () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  },
};

// Re-export everything from @testing-library/react
export * from '@testing-library/react';
export { userEvent };