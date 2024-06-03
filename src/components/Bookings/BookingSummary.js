// BookingSummary.js
import React from 'react';
import './BookingSummary.css';

const BookingSummary = ({ selectedSeats, onCancel }) => {
    return (
        <div className="booking-summary">
            <h2>Booking Summary</h2>
            <ul>
                {selectedSeats.map(seatId => (
                    <li key={seatId}>Seat ID: {seatId}</li>
                ))}
            </ul>
            <button onClick={onCancel}>Close</button>
        </div>
    );
};

export default BookingSummary;
