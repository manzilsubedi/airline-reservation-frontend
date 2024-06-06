// src/components/Register/Register.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { register } from '../../services/api';
import './Register.css';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role] = useState('User'); // Default role is set to 'User'
    const navigate = useNavigate();
    const location = useLocation();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const userData = await register(name, email, password, role);
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
            }
        } catch (error) {
            alert(`Registration failed: ${error.message}`);
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <h2>Register</h2>
                <form onSubmit={handleRegister}>
                    <div className="form-group">
                        <label>Name:</label>
                        <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Email:</label>
                        <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Password:</label>
                        <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Role:</label>
                        <input type="text" className="form-control" value={role} readOnly />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block">Register</button>
                </form>
            </div>
        </div>
    );
};

export default Register;
