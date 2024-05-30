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
    if (isSelected) {
        seatClass += ' selected';
    }
    if (isLocked) {
        seatClass += ' locked';
    }
    if (isReserved) {
        seatClass += ' reserved';
    }

    return (
        <div className={seatClass} onClick={handleClick}>
            {seat.row}{seat.column}
        </div>
    );
};

export default Seat;
