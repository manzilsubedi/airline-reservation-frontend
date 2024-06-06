// src/components/WelcomePage/WelcomePage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomePage.css';

const WelcomePage = () => {
    const navigate = useNavigate();

    const handleBookNowClick = () => {
        navigate('/plane-selection');
    };

    return (
        <div className="welcome-page">
            <div className="welcome-content">
                <h1>Cheap Air</h1>
                <h2>An Afforable Carrier</h2>
                <button onClick={handleBookNowClick} className="btn btn-primary">BOOK NOW</button>
            </div>
        </div>
    );
};

export default WelcomePage;
