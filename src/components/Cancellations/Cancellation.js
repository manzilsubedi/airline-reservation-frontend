// Cancellation.js
import React, { useState } from 'react';
import axios from 'axios';
import './Cancellation.css';

const Cancellation = ({ planeId, userId }) => {
    const [bookingId, setBookingId] = useState('');

    const handleCancellation = () => {
        axios.post(`https://localhost:7264/api/SeatReservations/cancel`, { planeId, userId, bookingId })
            .then(response => {
                if (response.status === 200) {
                    alert('Booking cancelled successfully!');
                } else {
                    alert('Failed to cancel booking.');
                }
            })
            .catch(error => {
                if (error.response && error.response.status === 400) {
                    alert(error.response.data);
                } else {
                    console.error('There was an error cancelling the booking!', error);
                }
            });
    };

    return (
        <div className="cancellation">
            <h2>Cancellation</h2>
            <div>
                <label>
                    Booking ID:
                    <input type="text" value={bookingId} onChange={(e) => setBookingId(e.target.value)} />
                </label>
            </div>
            <button onClick={handleCancellation}>Cancel Booking</button>
        </div>
    );
};

export default Cancellation;
