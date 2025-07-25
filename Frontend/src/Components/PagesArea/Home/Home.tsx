import React from 'react';
import { useNavigate } from 'react-router-dom';
import "./Home.css";

export function Home(): JSX.Element {
    const navigate = useNavigate();

    return (
        <div className="Home">
            <div className="hero-section">
                <div className="hero-content">
                    <h1>Quoridor 3D</h1>
                    <p className="hero-subtitle">
                        Experience the classic strategy game in stunning 3D graphics
                    </p>
                    <p className="hero-description">
                        Navigate your player to the opposite side while strategically placing walls 
                        to block your opponent. Master the art of maze-building in this timeless 
                        board game brought to life with modern 3D visuals.
                    </p>
                    
                    <div className="hero-buttons">
                        <button 
                            className="cta-button primary"
                            onClick={() => navigate('/login')}
                        >
                            Start Playing
                        </button>
                        <button 
                            className="cta-button secondary"
                            onClick={() => navigate('/game', { 
                                state: { 
                                    gameSettings: { 
                                        boardSize: 9, 
                                        aiLevel: 'medium',
                                        soundEnabled: true,
                                        musicEnabled: true,
                                        showAnimations: true,
                                        cameraSpeed: 1.0,
                                        graphicsQuality: 'high'
                                    }, 
                                    gameMode: 'quick' 
                                } 
                            })}
                        >
                            Quick Demo
                        </button>
                    </div>
                </div>
                
                <div className="hero-visual">
                    <div className="game-preview">
                        <div className="preview-board">
                            <div className="preview-grid">
                                {Array.from({ length: 9 }, (_, i) => 
                                    Array.from({ length: 9 }, (_, j) => (
                                        <div 
                                            key={`${i}-${j}`} 
                                            className="preview-cell"
                                            style={{
                                                animationDelay: `${(i + j) * 0.1}s`
                                            }}
                                        />
                                    ))
                                ).flat()}
                            </div>
                            <div className="preview-player player-1" />
                            <div className="preview-player player-2" />
                            <div className="preview-wall wall-1" />
                            <div className="preview-wall wall-2" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="features-section">
                <div className="features-container">
                    <h2>Game Features</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">🎮</div>
                            <h3>Multiple Game Modes</h3>
                            <p>Play against AI or challenge other players in various difficulty levels</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🏆</div>
                            <h3>Progressive Difficulty</h3>
                            <p>Start with 5x5 boards and work your way up to expert 11x11 challenges</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🎨</div>
                            <h3>Customizable Themes</h3>
                            <p>Unlock beautiful textures and skins to personalize your game experience</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">💎</div>
                            <h3>Reward System</h3>
                            <p>Earn coins and diamonds through gameplay and complete daily missions</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="how-to-play-section">
                <div className="how-to-container">
                    <h2>How to Play</h2>
                    <div className="rules-grid">
                        <div className="rule-item">
                            <div className="rule-number">1</div>
                            <div className="rule-content">
                                <h4>Move Your Player</h4>
                                <p>Click on adjacent squares to move your player towards the opposite side of the board</p>
                            </div>
                        </div>
                        <div className="rule-item">
                            <div className="rule-number">2</div>
                            <div className="rule-content">
                                <h4>Place Walls</h4>
                                <p>Strategically place walls to block your opponent's path while keeping your own route open</p>
                            </div>
                        </div>
                        <div className="rule-item">
                            <div className="rule-number">3</div>
                            <div className="rule-content">
                                <h4>Win the Game</h4>
                                <p>Be the first player to reach the opposite side of the board to claim victory</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
