import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MakePayment.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button } from 'react-bootstrap';

//const API_URL = 'https://localhost:7264/api';
const API_URL = 'https://cheapair.azurewebsites.net/api';
const MakePayment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const {
        bookingId,
        planeId,
        seatIds,
        userId,
        totalPrice,
        travelDate,
        travelTime,
        passengers: initialPassengers
    } = location.state || {};

    // Log the received state for debugging
    console.log('Location State:', location.state);

    const [passengers, setPassengers] = useState(
        initialPassengers && initialPassengers.length > 0
            ? initialPassengers
            : seatIds
                ? seatIds.map(() => ({ name: '', passportNo: '', age: '' }))
                : []
    );

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState({ totalAmount: 0, discount: 0, passengers: [], seatIds: [] });

    useEffect(() => {
        if (
            !bookingId ||
            !planeId ||
            !seatIds ||
            !userId ||
            !totalPrice ||
            !travelDate ||
            !travelTime
        ) {
            alert('Missing necessary booking information. Redirecting to home page.');
            navigate('/');
        }
    }, [
        bookingId,
        planeId,
        seatIds,
        userId,
        totalPrice,
        travelDate,
        travelTime,
        navigate
    ]);

    const renderSeats = (seats) => {
        if (!seats || seats.length === 0) {
            return 'No seats selected.';
        }
        return seats.map(seat => `${seat.row}${seat.column}`).join(', ');
    };

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

    const handleConfirmPayment = async () => {
        const totalAmount = calculateTotalAmount();

        try {
            const paymentResponse = await axios.post(`${API_URL}/SeatReservations/pay`, {
                bookingId,
                planeId,
                seatIds,
                userId,
                totalPrice: totalAmount,
                travelDate,
                travelTime,
                passengers
            });

            if (paymentResponse.status === 200) {
                setPaymentDetails({
                    totalAmount,
                    discount: totalPrice - totalAmount,
                    passengers,
                    seatIds,
                });
                setShowPaymentModal(true);
            } else {
                alert('Payment failed. Please try again.');
            }
        } catch (error) {
            console.error('There was an error processing the payment!', error);
            alert('There was an error processing the payment. Please try again.');
        }
    };

    if (!seatIds || !seatIds.length) {
        return null; // Render nothing if there are no selected seats
    }

    return (
        <div className="make-payment-container container">
            <h2 className="text-center my-4">Confirm Payment</h2>
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

            <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Payment Receipt</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h5>Booking Details</h5>
                    <p><strong>Seat IDs:</strong> {paymentDetails.seatIds.join(', ')}</p>
                    <p><strong>Total Price:</strong> ${totalPrice.toFixed(2)}</p>
                    <p><strong>Discount:</strong> ${paymentDetails.discount.toFixed(2)}</p>
                    <p><strong>Amount Paid:</strong> ${paymentDetails.totalAmount.toFixed(2)}</p>
                    <h5>Passenger Details</h5>
                    {paymentDetails.passengers.map((passenger, index) => (
                        <div key={index}>
                            <p><strong>Name:</strong> {passenger.name}</p>
                            <p><strong>Passport Number:</strong> {passenger.passportNo}</p>
                            <p><strong>Age:</strong> {passenger.age}</p>
                        </div>
                    ))}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => navigate('/')}>Go to Home</Button>
                    <Button variant="primary" onClick={() => navigate('/user-bookings')}>Go to My Bookings</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default MakePayment;
