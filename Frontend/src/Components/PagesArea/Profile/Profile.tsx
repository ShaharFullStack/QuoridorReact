import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

export function Profile(): JSX.Element {
    const navigate = useNavigate();

    return (
        <div className="Profile">
            <div className="profile-container">
                <div className="profile-header">
                    <h1>User Profile</h1>
                    <button 
                        className="back-button"
                        onClick={() => navigate('/dashboard')}
                    >
                        ← Back to Dashboard
                    </button>
                </div>
                
                <div className="profile-content">
                    <div className="coming-soon">
                        <h2>Coming Soon!</h2>
                        <p>Profile customization and settings will be available in the next update.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}