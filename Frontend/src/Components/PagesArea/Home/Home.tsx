import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../Common/Button/Button';
import "./Home.css";

export function Home(): JSX.Element {
    const navigate = useNavigate();

    return (
        <div className="Home">
            <div className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Quoridor 3D</h1>
                    <p className="hero-subtitle">
                        Experience the classic strategy game in stunning 3D graphics
                    </p>
                    <p className="hero-description">
                        Navigate your player to the opposite side while strategically placing walls 
                        to block your opponent. Master the art of maze-building in this timeless 
                        board game brought to life with modern 3D visuals.
                    </p>
                    
                    <div className="hero-buttons">
                        <Button 
                            variant="primary"
                            size="large"
                            onClick={() => navigate('/login')}
                            aria-describedby="start-playing-desc"
                        >
                            Start Playing
                        </Button>
                        <span id="start-playing-desc" className="sr-only">
                            Register or login to start playing Quoridor 3D
                        </span>
                        
                        <Button 
                            variant="outline"
                            size="large"
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
                            aria-describedby="quick-demo-desc"
                        >
                            Quick Demo
                        </Button>
                        <span id="quick-demo-desc" className="sr-only">
                            Try the game immediately without registration
                        </span>
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
            <section className="how-to-play-section" aria-labelledby="how-to-play-title">
                <div className="how-to-container container">
                    <h2 id="how-to-play-title" className="section-title">How to Play</h2>
                    <div className="rules-grid grid grid-cols-3">
                        <article className="rule-item card" tabIndex={0}>
                            <div className="rule-content">
                                <h3 className="rule-title">Move Your Player</h3>
                                <p className="rule-description">
                                    Click on adjacent squares to move your player towards the opposite side of the board
                                </p>
                            </div>
                        </article>
                        <article className="rule-item card" tabIndex={0}>
                            <div className="rule-content">
                                <h3 className="rule-title">Place Walls</h3>
                                <p className="rule-description">
                                    Strategically place walls to block your opponent's path while keeping your own route open
                                </p>
                            </div>
                        </article>
                        <article className="rule-item card" tabIndex={0}>
                            <div className="rule-content">
                                <h3 className="rule-title">Win the Game</h3>
                                <p className="rule-description">
                                    Be the first player to reach the opposite side of the board to claim victory
                                </p>
                            </div>
                        </article>
                    </div>
                </div>
            </section>
        </div>
    );
}
