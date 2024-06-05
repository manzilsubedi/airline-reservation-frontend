import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Seat from '../Seat/Seat';
import './SeatSelection.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button } from 'react-bootstrap';

//const API_URL = 'https://localhost:7264/api';

const API_URL = 'https://cheapair.azurewebsites.net/api';
const SeatSelection = ({ planeId, userRole, selectedDate, selectedTime }) => {
    const [seats, setSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [userId, setUserId] = useState(localStorage.getItem('userId'));
    const [showModal, setShowModal] = useState(false);
    const unlockTimers = useRef({});
    const navigate = useNavigate();

    const FIRST_CLASS_PRICE = 200;
    const BUSINESS_CLASS_PRICE = 150;
    const ECONOMY_CLASS_PRICE = 100;

    useEffect(() => {
        if (planeId && selectedDate && selectedTime) {
            fetchSeats();
        }
        return () => {
            Object.values(unlockTimers.current).forEach(clearTimeout);
        };
    }, [planeId, selectedDate, selectedTime]);

    const fetchSeats = async () => {
        try {
            const response = await axios.get(`${API_URL}/SeatReservations/${planeId}`, {
                params: { travelDate: selectedDate, travelTime: selectedTime }
            });
            setSeats(response.data);
        } catch (error) {
            console.error('There was an error fetching the seats!', error);
        }
    };

    const handleSeatClick = (seatId) => {
        const seat = seats.find(s => s.id === seatId);
        if (userRole === 'user' && (seat.isReserved || seat.isLocked)) {
            alert('You cannot select a reserved or locked seat.');
            return;
        }
        if (selectedSeats.includes(seatId)) {
            setSelectedSeats(prevSelectedSeats => prevSelectedSeats.filter(id => id !== seatId));
            setTotalPrice(prevPrice => prevPrice - seat.price);
            unlockSeatForUser(seatId);
        } else {
            setSelectedSeats(prevSelectedSeats => [...prevSelectedSeats, seatId]);
            setTotalPrice(prevPrice => prevPrice + seat.price);
            if (userRole === 'user') {
                lockSeatForUser(seatId);
            }
        }
    };

    const lockSeatForUser = (seatId) => {
        axios.post(`${API_URL}/SeatReservations/lock`, { seatIds: [seatId], userId, planeId, travelDate: selectedDate, travelTime: selectedTime })
            .then(response => {
                if (response.status === 200) {
                    unlockTimers.current[seatId] = setTimeout(() => unlockSeatForUser(seatId), 10 * 60 * 1000);
                }
            })
            .catch(error => {
                console.error(`There was an error locking seat ${seatId}:`, error);
            });
    };

    const unlockSeatForUser = (seatId) => {
        axios.post(`${API_URL}/SeatReservations/unlock`, { seatIds: [seatId], userId, planeId, travelDate: selectedDate, travelTime: selectedTime })
            .then(response => {
                if (response.status === 200) {
                    setSelectedSeats(prevSelectedSeats => prevSelectedSeats.filter(id => id !== seatId));
                    clearTimeout(unlockTimers.current[seatId]);
                    delete unlockTimers.current[seatId];
                }
            })
            .catch(error => {
                console.error(`There was an error unlocking seat ${seatId}:`, error);
            });
    };

    const handleReserveSeats = () => {
        if (!userId) {
            navigate('/login');
            return;
        }

        if (selectedSeats.length === 0) {
            alert('Please select at least one seat to reserve.');
            return;
        }

        if (selectedSeats.length > 6) {
            alert('You cannot book more than six seats at once.');
            return;
        }

        if (userRole === 'user') {
            const invalidSeats = selectedSeats.filter(seatId => {
                const seat = seats.find(s => s.id === seatId);
                return (parseInt(seat.row) >= 4 && (seat.column === 'B' || seat.column === 'E'));
            });

            if (invalidSeats.length === 1 && selectedSeats.length < 2) {
                alert('You cannot book a single B or E seat from row 4. Please select multiple seats together.');
                return;
            }

            const selectedSeatsDetails = selectedSeats.map(seatId => seats.find(s => s.id === seatId));
            const rows = selectedSeatsDetails.reduce((acc, seat) => {
                if (!acc[seat.row]) {
                    acc[seat.row] = [];
                }
                acc[seat.row].push(seat.column);
                return acc;
            }, {});

            for (const row in rows) {
                const columns = rows[row].sort();
                for (let i = 0; i < columns.length - 1; i++) {
                    if (!isAdjacent(columns[i], columns[i + 1])) {
                        alert('Please book adjacent seats. Scatter booking not allowed');
                        return;
                    }
                }
            }

            const rowNumbers = Object.keys(rows).map(Number).sort((a, b) => a - b);
            for (let i = 0; i < rowNumbers.length - 1; i++) {
                if (rowNumbers[i + 1] - rowNumbers[i] > 1) {
                    alert('You can only book seats in the same row or adjacent rows.');
                    return;
                }
            }
        }

        axios.post(`${API_URL}/SeatReservations/reserve`, { planeId, seatIds: selectedSeats, userId, userRole, travelDate: selectedDate, travelTime: selectedTime })
            .then(response => {
                if (response.status === 200) {
                    alert('Seats reserved successfully!');
                    setSelectedSeats([]);
                    fetchSeats();
                } else {
                    alert('Failed to reserve seats.');
                }
            })
            .catch(error => {
                if (error.response && error.response.status === 400) {
                    alert('Failed to reserve seats: ' + error.response.data);
                } else {
                    console.error('There was an error reserving the seats!', error.response ? error.response.data : error.message);
                }
            });
    };

    const handlePayment = () => {
        if (!userId) {
            navigate('/login');
            return;
        }

        navigate('/make-payment', {
            state: {
                selectedSeats,
                userId,
                totalPrice,
                selectedDate,
                selectedTime,
            },
        });
    };

    const isAdjacent = (currentColumn, nextColumn) => {
        const columnOrder = ["A", "B", "C", "D", "E", "F"];
        const currentIndex = columnOrder.indexOf(currentColumn);
        const nextIndex = columnOrder.indexOf(nextColumn);
        return nextIndex - currentIndex === 1;
    };

    const handleLockSeats = () => {
        axios.post(`${API_URL}/SeatReservations/lock`, { seatIds: selectedSeats, userId, planeId, travelDate: selectedDate, travelTime: selectedTime })
            .then(response => {
                if (response.status === 200) {
                    alert('Seats locked successfully!');
                } else {
                    alert('Failed to lock seats.');
                }
            })
            .catch(error => {
                console.error('There was an error locking the seats!', error);
            });
    };

    const handleUnlockSeats = () => {
        axios.post(`${API_URL}/SeatReservations/unlock`, { seatIds: selectedSeats, userId, planeId, travelDate: selectedDate, travelTime: selectedTime })
            .then(response => {
                if (response.status === 200) {
                    alert('Seats unlocked successfully!');
                    fetchSeats();
                } else {
                    alert('Failed to unlock seats.');
                }
            })
            .catch(error => {
                console.error('There was an error unlocking the seats!', error);
            });
    };

    const handleUnreserveSeats = () => {
        axios.post(`${API_URL}/SeatReservations/unreserve`, { seatIds: selectedSeats, userId, planeId, travelDate: selectedDate, travelTime: selectedTime })
            .then(response => {
                if (response.status === 200) {
                    alert('Seats unreserved successfully!');
                    fetchSeats();
                } else {
                    alert('Failed to unreserve seats.');
                }
            })
            .catch(error => {
                console.error('There was an error unreserving the seats!', error);
            });
    };

    const renderSeats = () => {
        const firstClassRows = planeId === '1' ? [1, 2, 3] : [1, 2, 3, 4];
        const businessClassRows = planeId === '1' ? [4, 5, 6, 7] : [5, 6, 7, 8, 9, 10];
        const economyClassRows = planeId === '1' ? [8, 9, 10, 11, 12, 13, 14, 15] : [11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

        const allRows = [...firstClassRows, ...businessClassRows, ...economyClassRows];

        return allRows.map(row => {
            const seatsInRow = seats.filter(seat => seat.row === row.toString());
            seatsInRow.sort((a, b) => a.column.localeCompare(b.column));

            const leftSeats = seatsInRow.filter(seat => seat.column <= (planeId === '1' && row <= 3 ? 'B' : 'C'));
            const rightSeats = seatsInRow.filter(seat => seat.column > (planeId === '1' && row <= 3 ? 'B' : 'C'));

            return (
                <div key={row} className="seat-row">
                    <div className="seat-group">
                        {leftSeats.map(seat => (
                            <Seat
                                key={seat.id}
                                seat={seat}
                                isSelected={selectedSeats.includes(seat.id)}
                                onSeatClick={handleSeatClick}
                                isLocked={seat.isLocked}
                                isReserved={seat.isReserved}
                                userRole={userRole}
                            />
                        ))}
                    </div>
                    <div className="aisle"></div>
                    <div className="seat-group">
                        {rightSeats.map(seat => (
                            <Seat
                                key={seat.id}
                                seat={seat}
                                isSelected={selectedSeats.includes(seat.id)}
                                onSeatClick={handleSeatClick}
                                isLocked={seat.isLocked}
                                isReserved={seat.isReserved}
                                userRole={userRole}
                            />
                        ))}
                    </div>
                </div>
            );
        });
    };

    const renderLegend = () => (
        <div className="seat-legend">
            <h3>Seat Legend</h3>
            <ul>
                <li className="first-class">First Class: ${FIRST_CLASS_PRICE}</li>
                <li className="business-class">Business Class: ${BUSINESS_CLASS_PRICE}</li>
                <li className="economy-class">Economy Class: ${ECONOMY_CLASS_PRICE}</li>
            </ul>
        </div>
    );

    return (
        <div className="seat-selection-container">
            <div className="seat-grid">
                <h1>Select Your Seats</h1>
                {renderSeats()}
            </div>
            <div className="seat-selection-sidebar">
                {renderLegend()}
                <h2>Total Price: ${totalPrice}</h2>
                <ul>
                    {selectedSeats.map(seatId => {
                        const seat = seats.find(s => s.id === seatId);
                        return <li key={seatId}>{seat.row}{seat.column} - ${seat.price}</li>;
                    })}
                </ul>
                <button className="btn btn-primary" onClick={handleReserveSeats} disabled={selectedSeats.length === 0}>Reserve Seats</button>
                {userRole === 'staff' && (
                    <>
                        <button className="btn btn-secondary" onClick={handleLockSeats}>Lock Seats</button>
                        <button className="btn btn-secondary" onClick={handleUnlockSeats}>Unlock Seats</button>
                        <button className="btn btn-secondary" onClick={handleUnreserveSeats}>Unreserve Seats</button>
                    </>
                )}
                {totalPrice > 0 && (
                    <button className="btn btn-success" onClick={() => setShowModal(true)}>Pay for Seats</button>
                )}
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Payment</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Total Amount: ${totalPrice}</p>
                    <p>Proceed to payment?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handlePayment}>
                        Pay
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default SeatSelection;
