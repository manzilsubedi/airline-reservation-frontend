// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import PlaneSelection from './components/PlaneSelection/PlaneSelection';
import UserBookings from './components/Bookings/UserBookings';
import SeatSelection from './components/SeatSelection/SeatSelection';
import { logout } from './services/api';
import Navbar from './components/Navbar/Navbar';
import WelcomePage from './components/WelcomePage/WelcomePage';
import MakePayment from './components/Payment/MakePayment'; // Add MakePayment component
import './App.css';

const App = () => {
    const [selectedPlane, setSelectedPlane] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const userId = localStorage.getItem('userId');
        if (token) {
            setIsAuthenticated(true);
            setUserRole(role);
            setUserId(userId);
        }
    }, []);

    const handleLogin = (userData) => {
        setIsAuthenticated(true);
        setUserRole(userData.role);
        setUserId(userData.userId);
    };

    const handleLogout = () => {
        logout(userId)
            .then(() => {
                setIsAuthenticated(false);
                setUserRole(null);
                setUserId(null);
            })
            .catch(error => {
                console.error('Failed to logout:', error);
            });
    };

    const handleSelectPlane = (planeId, date, time) => {
        setSelectedPlane(planeId);
        setSelectedDate(date);
        setSelectedTime(time);
    };

    return (
        <Router>
            <div className="App">
                <Navbar userRole={userRole} setIsAuthenticated={setIsAuthenticated} />
                <Routes>
                    <Route path="/login" element={<Login onLogin={handleLogin} />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/welcome" element={<WelcomePage />} />
                    <Route path="/" element={<WelcomePage />} />
                    <Route path="/plane-selection" element={<PlaneSelection onSelectPlane={handleSelectPlane} />} />
                    <Route path="/seat-selection" element={<SeatSelection planeId={selectedPlane} userRole={userRole} selectedDate={selectedDate} selectedTime={selectedTime} />} />
                    <Route path="/user-bookings" element={<UserBookings />} />
                    <Route path="/make-payment" element={<MakePayment />} /> {/* Add MakePayment route */}
                    {isAuthenticated ? (
                        <Route path="*" element={<Navigate to="/" />} />
                    ) : (
                        <Route path="*" element={<Navigate to="/login" />} />
                    )}
                </Routes>
            </div>
        </Router>
    );
};

export default App;
