import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Seat from '../Seat/Seat';
import './SeatSelection.css';

// Define the API URL here
const API_URL = 'https://cheapair.azurewebsites.net/api';

// cosnt API_LOCAL = 'localhost' ? 'https://localhost:7264/api';

const SeatSelection = ({ planeId, userRole }) => {
    const [seats, setSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [userId] = useState("user123"); // For demo purposes
    const unlockTimers = useRef({});

    useEffect(() => {
        if (planeId) {
            axios.get(`${API_URL}/SeatReservations/${planeId}`)
                .then(response => {
                    setSeats(response.data);
                })
                .catch(error => {
                    console.error('There was an error fetching the seats!', error);
                });
        } else {
            axios.get(`${API_URL}/SeatReservations/all`)
                .then(response => {
                    setSeats(response.data);
                })
                .catch(error => {
                    console.error('There was an error fetching all seats!', error);
                });
        }

        return () => {
            Object.values(unlockTimers.current).forEach(clearTimeout);
        };
    }, [planeId]);

    const handleSeatClick = (seatId) => {
        const seat = seats.find(s => s.id === seatId);
        if (userRole === 'user' && (seat.isReserved || seat.isLocked)) {
            alert('You cannot select a reserved or locked seat.');
            return;
        }
        if (selectedSeats.includes(seatId)) {
            unlockSeatForUser(seatId);
        } else {
            setSelectedSeats(prevSelectedSeats => [...prevSelectedSeats, seatId]);
            if (userRole === 'user') {
                lockSeatForUser(seatId);
            }
        }
    };

    const lockSeatForUser = (seatId) => {
        axios.post(`${API_URL}/SeatReservations/lock?planeId=${planeId}&userId=${userId}`, [seatId])
            .then(response => {
                if (response.status === 200) {
                    unlockTimers.current[seatId] = setTimeout(() => unlockSeatForUser(seatId), 10 * 60 * 1000); // Unlock after 10 minutes
                }
            })
            .catch(error => {
                console.error(`There was an error locking seat ${seatId}:`, error);
            });
    };

    const unlockSeatForUser = (seatId) => {
        axios.post(`${API_URL}/SeatReservations/unlock?planeId=${planeId}&userId=${userId}`, [seatId])
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

        axios.post(`${API_URL}/SeatReservations/reserve?planeId=${planeId}&userId=${userId}&userRole=${userRole}`, selectedSeats)
            .then(response => {
                if (response.status === 200) {
                    alert('Seats reserved successfully!');
                    setSelectedSeats([]);
                    axios.get(`${API_URL}/SeatReservations/${planeId}`)
                        .then(response => {
                            setSeats(response.data);
                        })
                        .catch(error => {
                            console.error('There was an error fetching the seats!', error);
                        });
                } else {
                    alert(response.data);
                }
            })
            .catch(error => {
                if (error.response && error.response.status === 400) {
                    alert(error.response.data);
                } else {
                    console.error('There was an error reserving the seats!', error);
                }
            });
    };

    const isAdjacent = (currentColumn, nextColumn) => {
        const columnOrder = ["A", "B", "C", "D", "E", "F"];
        const currentIndex = columnOrder.indexOf(currentColumn);
        const nextIndex = columnOrder.indexOf(nextColumn);
        return nextIndex - currentIndex === 1;
    };

    const handleLockSeats = () => {
        axios.post(`${API_URL}/SeatReservations/lock?planeId=${planeId}&userId=${userId}`, selectedSeats)
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
        axios.post(`${API_URL}/SeatReservations/unlock?planeId=${planeId}&userId=${userId}`, selectedSeats)
            .then(response => {
                if (response.status === 200) {
                    alert('Seats unlocked successfully!');
                    axios.get(`${API_URL}/SeatReservations/${planeId}`)
                        .then(response => {
                            setSeats(response.data);
                        })
                        .catch(error => {
                            console.error('There was an error fetching the seats!', error);
                        });
                } else {
                    alert('Failed to unlock seats.');
                }
            })
            .catch(error => {
                console.error('There was an error unlocking the seats!', error);
            });
    };

    const handleUnreserveSeats = () => {
        axios.post(`${API_URL}/SeatReservations/unreserve?planeId=${planeId}&userId=${userId}&userRole=${userRole}`, selectedSeats)
            .then(response => {
                if (response.status === 200) {
                    alert('Seats unreserved successfully!');
                    axios.get(`${API_URL}/SeatReservations/${planeId}`)
                        .then(response => {
                            setSeats(response.data);
                        })
                        .catch(error => {
                            console.error('There was an error fetching the seats!', error);
                        });
                } else {
                    alert('Failed to unreserve seats.');
                }
            })
            .catch(error => {
                console.error('There was an error unreserving the seats!', error);
            });
    };

    const groupedSeats = seats.reduce((acc, seat) => {
        if (!acc[seat.row]) {
            acc[seat.row] = [];
        }
        acc[seat.row].push(seat);
        return acc;
    }, {});

    const renderSeats = (row, seatsInRow) => {
        const leftSeats = seatsInRow.filter(seat => seat.column <= (row <= 3 || (planeId === '66587ae20cef16eb96e81a6b' && row >= 1 && row <= 4) ? 'B' : 'C'));
        const rightSeats = seatsInRow.filter(seat => seat.column > (row <= 3 || (planeId === '66587ae20cef16eb96e81a6b' && row >= 1 && row <= 4) ? 'B' : 'C'));

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
    };

    return (
        <div className="seat-selection-container">
            <h1>Select Your Seats</h1>
            <div className="seat-grid">
                {Object.keys(groupedSeats).map(row => {
                    const seatsInRow = groupedSeats[row];
                    if (planeId === '66587ae20cef16eb96e81a6b') {
                        if (parseInt(row) === 33) {
                            const rightSeats = seatsInRow.filter(seat => ['D', 'E', 'F'].includes(seat.column));
                            return renderSeats(row, rightSeats);
                        } else if (parseInt(row) >= 1 && parseInt(row) <= 4) {
                            const limitedSeats = seatsInRow.filter(seat => ['A', 'B', 'C', 'D'].includes(seat.column));
                            return renderSeats(row, limitedSeats);
                        }
                    }
                    return renderSeats(row, seatsInRow);
                })}
            </div>
            <div className="action-buttons">
                <button onClick={handleReserveSeats}>Reserve Seats</button>
                {userRole === 'staff' && (
                    <>
                        <button onClick={handleLockSeats}>Lock Seats</button>
                        <button onClick={handleUnlockSeats}>Unlock Seats</button>
                        <button onClick={handleUnreserveSeats}>Unreserve Seats</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default SeatSelection;
