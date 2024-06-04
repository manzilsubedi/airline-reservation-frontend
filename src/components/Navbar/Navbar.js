// src/components/Navbar/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../services/api';
import './Navbar.css';

const Navbar = ({ userRole, setIsAuthenticated }) => {
    const navigate = useNavigate();
    const handleLogout = async () => {
        const userId = localStorage.getItem('userId');
        await logout(userId);
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        setIsAuthenticated(false);
        navigate('/login');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <Link className="navbar-brand" to="/">Airline Reservation</Link>
            <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav ml-auto">
                    <li className="nav-item">
                        <Link className="nav-link" to="/">Plane Selection</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/user-bookings">My Bookings</Link>
                    </li>
                    <li className="nav-item">
                        <button className="btn btn-link nav-link" onClick={handleLogout}>Logout</button>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
