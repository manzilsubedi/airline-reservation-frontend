import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PlaneSelection.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const PlaneSelection = ({ onSelectPlane }) => {
    const [selectedPlane, setSelectedPlane] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [availableTimes, setAvailableTimes] = useState([]);
    const [selectedTime, setSelectedTime] = useState('');
    const navigate = useNavigate();

    const handlePlaneChange = (e) => {
        setSelectedPlane(e.target.value);
        setSelectedDate('');
        setAvailableTimes([]);
        setSelectedTime('');
    };

    const handleDateChange = (e) => {
        const date = e.target.value;
        setSelectedDate(date);
        const day = new Date(date).getDay();
        if (selectedPlane === '66587ad30cef16eb96e7fedc') {
            if ([0,1,2,3,4,5,6].includes(day)) {
                setAvailableTimes(['07:00']);
            } else {
                setAvailableTimes([]);
            }
        } else if (selectedPlane === '66587ae20cef16eb96e81a6b') {
            if ([1, 3, 5, 6].includes(day)) {
                setAvailableTimes(['13:00', '21:00']);
            } else {
                setAvailableTimes([]);
            }
        }
        setSelectedTime('');
    };

    const handleTimeChange = (e) => {
        setSelectedTime(e.target.value);
    };

    const handleSelection = () => {
        if (selectedPlane && selectedDate && selectedTime) {
            onSelectPlane(selectedPlane, selectedDate, selectedTime);
            navigate('/seat-selection');
        } else {
            alert('Please select a plane, date, and time.');
        }
    };

    return (
        <div className="plane-selection-container">
            <h1>Welcome to CheapAir</h1>
            <h3>Your journey starts here</h3>
            <div className="plane-selection-background">
             
            </div>
            <div className="form-group">
                <label htmlFor="plane">Select Your Plane</label>
                <select id="plane" className="form-control" value={selectedPlane} onChange={handlePlaneChange}>
                    <option value="">Select Plane</option>
                    <option value="66587ad30cef16eb96e7fedc">Plane 1</option>
                    <option value="66587ae20cef16eb96e81a6b">Plane 2</option>
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="date">Select Date</label>
                <input type="date" id="date" className="form-control" value={selectedDate} onChange={handleDateChange} />
            </div>
            <div className="form-group">
                <label htmlFor="time">Select Time</label>
                <select id="time" className="form-control" value={selectedTime} onChange={handleTimeChange} disabled={!selectedDate}>
                    <option value="">Select Time</option>
                    {availableTimes.map(time => (
                        <option key={time} value={time}>{time}</option>
                    ))}
                </select>
            </div>
            <button className="btn btn-primary" onClick={handleSelection} disabled={!selectedPlane || !selectedDate || !selectedTime}>
                Proceed to Seat Selection
            </button>
        </div>
    );
};

export default PlaneSelection;
