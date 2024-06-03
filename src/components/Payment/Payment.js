// Payment.js
import React, { useState } from 'react';
import './Payment.css';

const Payment = ({ selectedSeats, userId, onConfirm, onCancel }) => {
    const [age, setAge] = useState('');

    const handlePayment = () => {
        const discount = age <= 15 ? 0.25 : 0;
        const totalAmount = selectedSeats.length * 100 * (1 - discount); // Assuming each seat costs 100 units
        alert(`Total amount to be paid: ${totalAmount}`);
        onConfirm();
    };

    return (
        <div className="payment">
            <h2>Payment Details</h2>
            <div>
                <label>
                    Age:
                    <input type="number" value={age} onChange={(e) => setAge(e.target.value)} />
                </label>
            </div>
            <button onClick={handlePayment}>Confirm Payment</button>
            <button onClick={onCancel}>Cancel</button>
        </div>
    );
};

export default Payment;
