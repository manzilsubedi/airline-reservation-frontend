// src/components/Payment/Payment.js
import React, { useState } from 'react';
import './Payment.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

const Payment = ({ selectedSeats, userId, totalPrice, travelDate, travelTime }) => {
    const [passengers, setPassengers] = useState(selectedSeats.map(() => ({ name: '', passportNo: '', age: '' })));
    const navigate = useNavigate();

    const handlePassengerChange = (index, field, value) => {
        const updatedPassengers = [...passengers];
        updatedPassengers[index][field] = value;
        setPassengers(updatedPassengers);
    };

    const calculateTotalAmount = () => {
        return passengers.reduce((acc, passenger) => {
            const discount = passenger.age <= 15 ? 0.25 : 0;
            return acc + 100 * (1 - discount); // Assuming each seat costs 100 units
        }, 0);
    };

    const handleConfirmPayment = () => {
        const totalAmount = calculateTotalAmount();
        alert(`Total amount to be paid: ${totalAmount}`);
        // Simulate payment processing
        alert('Payment successful! Your booking is confirmed.');
        navigate('/'); // Redirect to home or booking confirmation page
    };

    return (
        <div className="payment-container container">
            <h2 className="text-center my-4">Payment Details</h2>
            <div className="card mb-4">
                <div className="card-header">
                    <h5>Passenger Information</h5>
                </div>
                <div className="card-body">
                    {passengers.map((passenger, index) => (
                        <div key={index} className="passenger-info mb-3">
                            <h6>Passenger {index + 1}</h6>
                            <div className="form-group">
                                <label>Name:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={passenger.name}
                                    onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Passport No / ID No:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={passenger.passportNo}
                                    onChange={(e) => handlePassengerChange(index, 'passportNo', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Age:</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={passenger.age}
                                    onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="total-amount text-center mb-4">
                <h5>Total Amount: ${calculateTotalAmount().toFixed(2)}</h5>
            </div>
            <div className="text-center">
                <button className="btn btn-success mx-2" onClick={handleConfirmPayment}>Confirm Payment</button>
                <button className="btn btn-secondary mx-2" onClick={() => navigate(-1)}>Go Back</button>
            </div>
        </div>
    );
};

export default Payment;
