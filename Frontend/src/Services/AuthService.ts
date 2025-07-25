import { User, LoginCredentials, RegisterData, AuthResponse, AuthState } from '../Types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

/**
 * Authentication service for handling user login, registration, and session management
 */
export class AuthService {
    private static instance: AuthService;
    private authState: AuthState = {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
    };
    private listeners: Array<(state: AuthState) => void> = [];

    private constructor() {
        // Check for existing session on initialization
        this.initializeFromStorage();
    }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    /**
     * Subscribe to auth state changes
     */
    public subscribe(listener: (state: AuthState) => void): () => void {
        this.listeners.push(listener);
        // Return unsubscribe function
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    /**
     * Get current auth state
     */
    public getAuthState(): AuthState {
        return { ...this.authState };
    }

    /**
     * Initialize auth state from localStorage
     */
    private initializeFromStorage(): void {
        try {
            const token = localStorage.getItem('auth_token');
            const userStr = localStorage.getItem('auth_user');
            
            if (token && userStr) {
                const user = JSON.parse(userStr);
                this.updateState({
                    user,
                    token,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null
                });
            }
        } catch (error) {
            console.error('Failed to initialize auth from storage:', error);
            this.clearStorage();
        }
    }

    /**
     * Update auth state and notify listeners
     */
    private updateState(newState: Partial<AuthState>): void {
        this.authState = { ...this.authState, ...newState };
        this.listeners.forEach(listener => listener(this.authState));
    }

    /**
     * Save auth data to localStorage
     */
    private saveToStorage(user: User, token: string): void {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(user));
    }

    /**
     * Clear auth data from localStorage
     */
    private clearStorage(): void {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
    }

    /**
     * Login with email and password
     */
    public async login(credentials: LoginCredentials): Promise<AuthResponse> {
        this.updateState({ isLoading: true, error: null });

        try {
            // For now, simulate API call with mock data
            // TODO: Replace with actual API call when backend is ready
            const mockResponse = await this.mockLogin(credentials);
            
            this.saveToStorage(mockResponse.user, mockResponse.token);
            this.updateState({
                user: mockResponse.user,
                token: mockResponse.token,
                isAuthenticated: true,
                isLoading: false,
                error: null
            });

            return mockResponse;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Login failed';
            this.updateState({
                isLoading: false,
                error: errorMessage
            });
            throw error;
        }
    }

    /**
     * Register new user
     */
    public async register(data: RegisterData): Promise<AuthResponse> {
        this.updateState({ isLoading: true, error: null });

        try {
            // Validate passwords match
            if (data.password !== data.confirmPassword) {
                throw new Error('Passwords do not match');
            }

            // For now, simulate API call with mock data
            // TODO: Replace with actual API call when backend is ready
            const mockResponse = await this.mockRegister(data);
            
            this.saveToStorage(mockResponse.user, mockResponse.token);
            this.updateState({
                user: mockResponse.user,
                token: mockResponse.token,
                isAuthenticated: true,
                isLoading: false,
                error: null
            });

            return mockResponse;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Registration failed';
            this.updateState({
                isLoading: false,
                error: errorMessage
            });
            throw error;
        }
    }

    /**
     * Logout current user
     */
    public async logout(): Promise<void> {
        try {
            // TODO: Call logout API endpoint
            // await this.apiCall('/auth/logout', 'POST');
            
            this.clearStorage();
            this.updateState({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
                error: null
            });
        } catch (error) {
            console.error('Logout error:', error);
            // Force logout even if API call fails
            this.clearStorage();
            this.updateState({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
                error: null
            });
        }
    }

    /**
     * Refresh user data
     */
    public async refreshUser(): Promise<User> {
        if (!this.authState.token) {
            throw new Error('No authentication token');
        }

        try {
            // TODO: Replace with actual API call
            const mockUser = await this.mockGetUser(this.authState.token);
            
            this.updateState({ user: mockUser });
            this.saveToStorage(mockUser, this.authState.token);
            
            return mockUser;
        } catch (error) {
            // If refresh fails, logout user
            await this.logout();
            throw error;
        }
    }

    /**
     * Check if user is authenticated
     */
    public isAuthenticated(): boolean {
        return this.authState.isAuthenticated && !!this.authState.token;
    }

    /**
     * Get current user
     */
    public getCurrentUser(): User | null {
        return this.authState.user;
    }

    /**
     * Get auth token
     */
    public getToken(): string | null {
        return this.authState.token;
    }

    // Mock methods - TODO: Replace with actual API calls

    private async mockLogin(credentials: LoginCredentials): Promise<AuthResponse> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock validation
        if (credentials.email === 'demo@example.com' && credentials.password === 'demo123') {
            return {
                user: this.createMockUser(credentials.email, 'Demo User'),
                token: 'mock-jwt-token-' + Date.now(),
                refreshToken: 'mock-refresh-token-' + Date.now()
            };
        }

        // Accept any email/password for demo purposes
        return {
            user: this.createMockUser(credentials.email, credentials.email.split('@')[0]),
            token: 'mock-jwt-token-' + Date.now(),
            refreshToken: 'mock-refresh-token-' + Date.now()
        };
    }

    private async mockRegister(data: RegisterData): Promise<AuthResponse> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1200));

        // Mock validation
        if (data.email === 'existing@example.com') {
            throw new Error('Email already exists');
        }

        return {
            user: this.createMockUser(data.email, data.username),
            token: 'mock-jwt-token-' + Date.now(),
            refreshToken: 'mock-refresh-token-' + Date.now()
        };
    }

    private async mockGetUser(token: string): Promise<User> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Mock user data
        return this.createMockUser('user@example.com', 'Current User');
    }

    private createMockUser(email: string, displayName: string): User {
        return {
            id: 'user-' + Date.now(),
            username: displayName.toLowerCase().replace(/\s+/g, ''),
            email,
            displayName,
            level: 1,
            experience: 0,
            coins: 1000,
            diamonds: 10,
            createdAt: new Date(),
            lastLogin: new Date(),
            preferences: {
                language: 'en',
                soundEnabled: true,
                musicEnabled: true,
                graphicsQuality: 'high',
                cameraSpeed: 1.0,
                showAnimations: true,
                selectedSkins: {
                    boardTexture: 'stone-tile',
                    wallTexture: 'black-white-tile',
                    goalTexture: 'dark-tiles',
                    playerSkin: 'default'
                }
            },
            statistics: {
                gamesPlayed: 0,
                gamesWon: 0,
                gamesLost: 0,
                winRate: 0,
                averageGameTime: 0,
                bestTime: 0,
                totalPlayTime: 0,
                favoriteGameMode: 'pvp',
                highestLevelReached: 1,
                perfectGames: 0,
                longestWinStreak: 0,
                currentWinStreak: 0
            }
        };
    }

    /**
     * Make authenticated API call
     */
    private async apiCall(endpoint: string, method: string = 'GET', data?: any): Promise<any> {
        const url = `${API_BASE_URL}${endpoint}`;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };

        if (this.authState.token) {
            headers.Authorization = `Bearer ${this.authState.token}`;
        }

        const response = await fetch(url, {
            method,
            headers,
            body: data ? JSON.stringify(data) : undefined
        });

        if (!response.ok) {
            throw new Error(`API call failed: ${response.statusText}`);
        }

        return await response.json();
    }
}

// Export singleton instance
export const authService = AuthService.getInstance();