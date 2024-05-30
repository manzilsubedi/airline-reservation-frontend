import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import PlaneSelection from './components/PlaneSelection/PlaneSelection';
import SeatSelection from './components/SeatSelection/SeatSelection';
import { logout } from './services/api'; 
import './App.css';

const App = () => {
    const [selectedPlane, setSelectedPlane] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        if (token) {
            setIsAuthenticated(true);
            setUserRole(role);
        }
    }, []);

    const handleLogin = (userData) => {
        setIsAuthenticated(true);
        setUserRole(userData.role);
    };
   
    const handleLogout = () => {
        const userId = userId;
        logout(userId)
            .then(() => {
                setIsAuthenticated(false);
                setUserRole(null);
            })
            .catch(error => {
                console.error('Failed to logout:', error);
            });
    };
    


    const handleSelectPlane = (planeId) => {
        setSelectedPlane(planeId);
    };

    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/login" element={<Login onLogin={handleLogin} />} />
                    <Route path="/register" element={<Register />} />
                    {isAuthenticated ? (
                        <>
                            <Route path="/" element={<PlaneSelection onSelectPlane={handleSelectPlane} />} />
                            {selectedPlane && <Route path="/seat-selection" element={<SeatSelection planeId={selectedPlane} userRole={userRole} />} />}
                            <Route path="*" element={<Navigate to="/" />} />
                        </>
                    ) : (
                        <Route path="*" element={<Navigate to="/login" />} />
                    )}
                </Routes>
            </div>
        </Router>
    );
};

export default App;
