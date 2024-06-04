import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Container, Card, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './UserBookings.css';

const API_URL = 'https://localhost:7264/api'; // or your actual API base URL

const UserBookings = () => {
    const [bookings, setBookings] = useState([]);
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        if (userId) {
            axios.get(`${API_URL}/SeatReservations/bookings?userId=${userId}`)
                .then(response => {
                    setBookings(response.data);
                })
                .catch(error => {
                    console.error('There was an error fetching the bookings!', error);
                });
        }
    }, [userId]);

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

    const renderSeats = (seats) => {
        return seats.map(seat => `${seat.row}${seat.column}`).join(', ');
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
                                    <Button variant="danger" onClick={() => handleCancelBooking(booking.id)}>Cancel Booking</Button>
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
