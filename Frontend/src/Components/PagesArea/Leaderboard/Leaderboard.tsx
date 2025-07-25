import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Leaderboard.css';

export function Leaderboard(): JSX.Element {
    const navigate = useNavigate();

    return (
        <div className="Leaderboard">
            <div className="leaderboard-container">
                <div className="leaderboard-header">
                    <h1>🏆 Leaderboard</h1>
                    <button 
                        className="back-button"
                        onClick={() => navigate('/dashboard')}
                    >
                        ← Back to Dashboard
                    </button>
                </div>
                
                <div className="leaderboard-content">
                    <div className="coming-soon">
                        <h2>Coming Soon!</h2>
                        <p>Global rankings and competitive leaderboards will be available in the next update.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}