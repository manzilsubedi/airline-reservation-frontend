import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Container, Card, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './UserBookings.css';
import { useNavigate } from 'react-router-dom';

//const API_URL = 'https://localhost:7264/api'; // or your actual API base URL
const API_URL = 'https://cheapair.azurewebsites.net/api';
const UserBookings = () => {
    const [bookings, setBookings] = useState([]);
    const userId = localStorage.getItem('userId');
    const navigate = useNavigate();

    useEffect(() => {
        if (userId) {
            fetchBookings();
        }
    }, [userId]);

    const fetchBookings = () => {
        axios.get(`${API_URL}/SeatReservations/bookings?userId=${userId}`)
            .then(response => {
                setBookings(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the bookings!', error);
            });
    };

    const handleCancelBooking = (bookingId) => {
        axios.post(`${API_URL}/SeatReservations/cancelBooking`, { bookingId, userId })
            .then(response => {
                if (response.status === 200) {
                    alert('Booking cancelled successfully!');
                    setBookings(bookings.filter(booking => booking.id !== bookingId));
                } else {
                    alert('Failed to cancel booking.');
                }
            })
            .catch(error => {
                console.error('There was an error cancelling the booking!', error);
            });
    };

    const handleMakePayment = (booking) => {
        console.log('Booking details:', booking);

        if (!booking || !booking.id || !booking.planeId || !booking.seats) {
            console.error('Missing necessary booking information:', booking);
            alert('Missing necessary booking information. Redirecting to home page.');
            navigate('/');
            return;
        }

        navigate('/make-payment', {
            state: {
                bookingId: booking.id,
                planeId: booking.planeId,
                seatIds: booking.seats.map(seat => seat.id),
                userId,
                totalPrice: booking.totalPrice,
                travelDate: booking.travelDate,
                travelTime: booking.travelTime,
                passengers: booking.passengers || [] // Ensure passengers are passed if available
            },
        });
    };

    const renderSeats = (seats) => {
        if (!seats || seats.length === 0) {
            return 'No seats selected.';
        }
        return seats.map(seat => `${seat.row}${seat.column}`).join(', ');
    };

    const renderPassengers = (passengers) => {
        if (!passengers || passengers.length === 0) {
            return <p>No passengers added yet.</p>;
        }
        return passengers.map((passenger, index) => (
            <div key={index}>
                <p><strong>Name:</strong> {passenger.name}</p>
                <p><strong>Passport Number:</strong> {passenger.passportNumber}</p>
                <p><strong>Age:</strong> {passenger.age}</p>
            </div>
        ));
    };

    return (
        <Container className="mt-5">
            <h1 className="text-center mb-4">My Bookings</h1>
            {bookings.length === 0 ? (
                <p className="text-center">No bookings found.</p>
            ) : (
                <Row>
                    {bookings.map(booking => (
                        <Col md={6} key={booking.id} className="mb-4">
                            <Card>
                                <Card.Header>Booking ID: {booking.id}</Card.Header>
                                <Card.Body>
                                    <Card.Text>
                                        <strong>Plane ID:</strong> {booking.planeId}
                                    </Card.Text>
                                    <Card.Text>
                                        <strong>Seats:</strong> {renderSeats(booking.seats)}
                                    </Card.Text>
                                    <Card.Text>
                                        <strong>Total Price:</strong> ${booking.totalPrice}
                                    </Card.Text>
                                    <Card.Text>
                                        <strong>Booking Date:</strong> {new Date(booking.bookingDate).toLocaleString()}
                                    </Card.Text>
                                    <Card.Text>
                                        <strong>Travel Date:</strong> {new Date(booking.travelDate).toLocaleDateString()}
                                    </Card.Text>
                                    <Card.Text>
                                        <strong>Travel Time:</strong> {booking.travelTime}
                                    </Card.Text>
                                    {booking.isPaid ? (
                                        <div>
                                            <Button variant="success" disabled>Paid</Button>
                                            <div className="mt-3">
                                                <h5>Passengers:</h5>
                                                {renderPassengers(booking.passengers)}
                                            </div>
                                        </div>
                                    ) : (
                                        <Button variant="primary" onClick={() => handleMakePayment(booking)}>Pay Now</Button>
                                    )}
                                    <Button variant="danger" onClick={() => handleCancelBooking(booking.id)} className="ml-2">Cancel Booking</Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default UserBookings;
