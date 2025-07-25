import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginCredentials, RegisterData } from '../../../Types';
import './Login.css';

export function Login(): JSX.Element {
    const [isLogin, setIsLogin] = useState(true);
    const [credentials, setCredentials] = useState<LoginCredentials>({
        email: '',
        password: ''
    });
    const [registerData, setRegisterData] = useState<RegisterData>({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const navigate = useNavigate();

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // TODO: Implement actual authentication service
            console.log('Login attempt:', credentials);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // For now, navigate to dashboard
            navigate('/dashboard');
        } catch (err) {
            setError('Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (registerData.password !== registerData.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            // TODO: Implement actual registration service
            console.log('Register attempt:', registerData);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // For now, navigate to dashboard
            navigate('/dashboard');
        } catch (err) {
            setError('Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="Login">
            <div className="login-container">
                <div className="login-header">
                    <h1>Quoridor 3D</h1>
                    <div className="login-tabs">
                        <button 
                            className={isLogin ? 'active' : ''}
                            onClick={() => setIsLogin(true)}
                        >
                            Login
                        </button>
                        <button 
                            className={!isLogin ? 'active' : ''}
                            onClick={() => setIsLogin(false)}
                        >
                            Register
                        </button>
                    </div>
                </div>

                {error && <div className="error-message">{error}</div>}

                {isLogin ? (
                    <form onSubmit={handleLoginSubmit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={credentials.email}
                                onChange={(e) => setCredentials({
                                    ...credentials,
                                    email: e.target.value
                                })}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={credentials.password}
                                onChange={(e) => setCredentials({
                                    ...credentials,
                                    password: e.target.value
                                })}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="submit-button"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleRegisterSubmit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                value={registerData.username}
                                onChange={(e) => setRegisterData({
                                    ...registerData,
                                    username: e.target.value
                                })}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="reg-email">Email</label>
                            <input
                                type="email"
                                id="reg-email"
                                value={registerData.email}
                                onChange={(e) => setRegisterData({
                                    ...registerData,
                                    email: e.target.value
                                })}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="reg-password">Password</label>
                            <input
                                type="password"
                                id="reg-password"
                                value={registerData.password}
                                onChange={(e) => setRegisterData({
                                    ...registerData,
                                    password: e.target.value
                                })}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirm-password">Confirm Password</label>
                            <input
                                type="password"
                                id="confirm-password"
                                value={registerData.confirmPassword}
                                onChange={(e) => setRegisterData({
                                    ...registerData,
                                    confirmPassword: e.target.value
                                })}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="submit-button"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating Account...' : 'Register'}
                        </button>
                    </form>
                )}

                <div className="login-footer">
                    <button 
                        onClick={() => navigate('/')}
                        className="back-button"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
}