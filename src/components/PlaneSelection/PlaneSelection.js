// src/components/PlaneSelection/PlaneSelection.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PlaneSelection.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const PlaneSelection = ({ onSelectPlane }) => {
    const [selectedPlane, setSelectedPlane] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const navigate = useNavigate();

    const handlePlaneChange = (e) => {
        setSelectedPlane(e.target.value);
        setSelectedDate('');
        setSelectedTime('');
    };

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
        setSelectedTime('');
    };

    const handleTimeChange = (e) => {
        setSelectedTime(e.target.value);
    };

    const handlePlaneSelect = () => {
        if (selectedDate && selectedTime && selectedPlane) {
            onSelectPlane(selectedPlane, selectedDate, selectedTime);
            navigate('/seat-selection');
        } else {
            alert('Please select a plane, date, and time.');
        }
    };

    const getAvailableDates = () => {
        const today = new Date();
        const dates = [];
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const day = date.getDay();
            if (selectedPlane === 'plane1' && [0, 2, 4].includes(day)) {
                dates.push(date.toISOString().split('T')[0]);
            } else if (selectedPlane === 'plane2' && [1, 3, 5, 6].includes(day)) {
                dates.push(date.toISOString().split('T')[0]);
            }
        }
        return dates;
    };

    const getAvailableTimes = () => {
        const day = new Date(selectedDate).getDay();
        if (selectedPlane === 'plane1' && [0, 2, 4].includes(day)) {
            return <option value="07:00">07:00 AM</option>;
        } else if (selectedPlane === 'plane2' && [1, 3, 5, 6].includes(day)) {
            return (
                <>
                    <option value="13:00">01:00 PM</option>
                    <option value="21:00">09:00 PM</option>
                </>
            );
        }
        return null;
    };

    return (
        <div className="plane-selection-container">
            <h1>Welcome to CheapAir</h1>
            <h3>Your journey starts here</h3>
            <img src="path/to/plane-image.jpg" alt="Plane" />
            <div className="form-group">
                <label htmlFor="plane">Select Your Plane</label>
                <select id="plane" className="form-control" value={selectedPlane} onChange={handlePlaneChange}>
                    <option value="">Select Plane</option>
                    <option value="plane1">Plane 1</option>
                    <option value="plane2">Plane 2</option>
                </select>
            </div>
            {selectedPlane && (
                <>
                    <div className="form-group">
                        <label htmlFor="date">Select Date:</label>
                        <input
                            type="date"
                            id="date"
                            className="form-control"
                            value={selectedDate}
                            onChange={handleDateChange}
                            min={new Date().toISOString().split('T')[0]}
                            max={new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0]}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="time">Select Time:</label>
                        <select
                            id="time"
                            className="form-control"
                            value={selectedTime}
                            onChange={handleTimeChange}
                            disabled={!selectedDate}
                        >
                            <option value="">Select Time</option>
                            {selectedDate && getAvailableTimes()}
                        </select>
                    </div>
                </>
            )}
            <div>
                <button
                    onClick={handlePlaneSelect}
                    className="btn btn-plane"
                    disabled={!selectedPlane || !selectedDate || !selectedTime}
                >
                    Proceed
                </button>
            </div>
        </div>
    );
};

export default PlaneSelection;
