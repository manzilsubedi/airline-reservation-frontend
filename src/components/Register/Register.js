// src/components/Register/Register.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { register } from '../../services/api';
import './Register.css';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const handleRegister = async (e) => {
        e.preventDefault();
        const userData = await register(email, password);
        if (userData) {
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
                navigate('/login');
            }
        } else {
            alert('Registration failed. Please try again.');
        }
    };

    return (
        <div className="register-container">
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
                <div className="form-group">
                    <label>Email:</label>
                    <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Password:</label>
                    <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary">Register</button>
            </form>
        </div>
    );
};

export default Register;
