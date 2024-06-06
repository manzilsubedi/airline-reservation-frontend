// src/components/Login/Login.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../../services/api';
import './Login.css';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const userData = await login(email, password);
            if (userData) {
                onLogin(userData);
                const state = location.state || {};
                const { selectedSeats, planeId, selectedDate, selectedTime, userRole } = state;
                if (selectedSeats && planeId && selectedDate && selectedTime && userRole) {
                    navigate('/seat-selection', {
                        state: {
                            selectedSeats,
                            planeId,
                            selectedDate,
                            selectedTime,
                            userRole,
                        },
                    });
                } else {
                    navigate('/');
                }
            } else {
                alert('Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Login failed', error.response ? error.response.data : error.message);
            alert('Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <div className="form-group">
                    <label>Email:</label>
                    <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Password:</label>
                    <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary">Login</button>
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/register')}>Register</button>
            </form>
        </div>
    );
};

export default Login;
