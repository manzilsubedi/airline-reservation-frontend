// Seat.js
import React from 'react';
import './Seat.css';

const Seat = ({ seat, isSelected, onSeatClick, isLocked, isReserved, userRole }) => {
    const handleClick = () => {
        if (userRole === 'staff') {
            // Staff can toggle lock/unlock by clicking
            onSeatClick(seat.id);
        } else if (!isReserved && !isLocked) {
            // Users can only select/unselect available seats
            onSeatClick(seat.id);
        }
    };

    let seatClass = 'seat';

    // Determine seat category based on row number
    if (seat.row <= 3) {
        seatClass += ' first-class';
    } else if (seat.row >= 4 && seat.row <= 7) {
        seatClass += ' business-class';
    } else {
        seatClass += ' economy-class';
    }

    // Apply states with higher priority to reserved and locked
    if (isLocked && isSelected) {
        seatClass += ' locked selected';
    } else if (isReserved && isSelected) {
        seatClass += ' reserved selected';
    } else if (isLocked) {
        seatClass += ' locked';
    } else if (isReserved) {
        seatClass += ' reserved';
    } else if (isSelected) {
        seatClass += ' selected';
    }

    return (
        <div className={seatClass} onClick={handleClick}>
            {seat.row}{seat.column}
        </div>
    );
};

export default Seat;
