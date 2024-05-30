import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Seat from '../Seat/Seat';
import './SeatSelection.css';

const SeatSelection = ({ planeId, userRole }) => {
    console.log('Plane ID:', planeId);  // Debugging line
    const [seats, setSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [userId] = useState("user123"); // For demo purposes
    const unlockTimers = useRef({});

    useEffect(() => {
        if (planeId) {
            console.log(`Fetching seats for planeId: ${planeId}`);
            axios.get(`https://localhost:7264/api/SeatReservations/${planeId}`)
                .then(response => {
                    console.log('Fetched seats:', response.data);
                    setSeats(response.data);
                })
                .catch(error => {
                    console.error('There was an error fetching the seats!', error);
                });
        } else {
            console.log('Fetching all seats');
            axios.get('https://localhost:7264/api/SeatReservations/all')
                .then(response => {
                    console.log('Fetched all seats:', response.data);
                    setSeats(response.data);
                })
                .catch(error => {
                    console.error('There was an error fetching all seats!', error);
                });
        }

        return () => {
            // Clear all unlock timers on component unmount
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
        axios.post(`https://localhost:7264/api/SeatReservations/lock?planeId=${planeId}&userId=${userId}`, [seatId])
            .then(response => {
                if (response.status === 200) {
                    console.log(`Seat ${seatId} locked for 10 minutes.`);
                    unlockTimers.current[seatId] = setTimeout(() => unlockSeatForUser(seatId), 10 * 60 * 1000); // Unlock after 10 minutes
                } else {
                    console.error(`Failed to lock seat ${seatId}.`);
                }
            })
            .catch(error => {
                console.error(`There was an error locking seat ${seatId}:`, error);
            });
    };

    const unlockSeatForUser = (seatId) => {
        axios.post(`https://localhost:7264/api/SeatReservations/unlock?planeId=${planeId}&userId=${userId}`, [seatId])
            .then(response => {
                if (response.status === 200) {
                    console.log(`Seat ${seatId} automatically unlocked after 10 minutes.`);
                    setSelectedSeats(prevSelectedSeats => prevSelectedSeats.filter(id => id !== seatId));
                    clearTimeout(unlockTimers.current[seatId]);
                    delete unlockTimers.current[seatId];
                } else {
                    console.error(`Failed to unlock seat ${seatId}.`);
                }
            })
            .catch(error => {
                console.error(`There was an error unlocking seat ${seatId}:`, error);
            });
    };

    const handleReserveSeats = () => {
        // User role restrictions
        if (userRole === 'user') {
            // Check if single B or E seat is being selected
            const invalidSeats = selectedSeats.filter(seatId => {
                const seat = seats.find(s => s.id === seatId);
                return (planeId === 1 && seat.row >= 4 && (seat.column === 'B' || seat.column === 'E')) ||
                       (planeId === 2 && seat.row >= 5 && (seat.column === 'B' || seat.column === 'E'));
            });

            if (invalidSeats.length > 0 && selectedSeats.length < 2) {
                alert('You cannot book a single B or E seat from row 4 in Plane 1 and row 5 in Plane 2.');
                return;
            }
        }

        // Unlock seats first, then reserve them
        axios.post(`https://localhost:7264/api/SeatReservations/unlock?planeId=${planeId}&userId=${userId}`, selectedSeats)
            .then(() => {
                axios.post(`https://localhost:7264/api/SeatReservations/reserve?planeId=${planeId}&userId=${userId}`, selectedSeats)
                    .then(response => {
                        if (response.status === 200) {
                            alert('Seats reserved successfully!');
                            setSelectedSeats([]);
                            // Refresh seat data
                            axios.get(`https://localhost:7264/api/SeatReservations/${planeId}`)
                                .then(response => {
                                    setSeats(response.data);
                                })
                                .catch(error => {
                                    console.error('There was an error fetching the seats!', error);
                                });
                        } else {
                            alert('Failed to reserve seats.');
                        }
                    })
                    .catch(error => {
                        console.error('There was an error reserving the seats!', error);
                    });
            })
            .catch(error => {
                console.error('There was an error unlocking the seats before reserving:', error);
            });
    };

    const handleLockSeats = () => {
        axios.post(`https://localhost:7264/api/SeatReservations/lock?planeId=${planeId}&userId=${userId}`, selectedSeats)
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
        axios.post(`https://localhost:7264/api/SeatReservations/unlock?planeId=${planeId}&userId=${userId}`, selectedSeats)
            .then(response => {
                if (response.status === 200) {
                    alert('Seats unlocked successfully!');
                    // Refresh seat data
                    axios.get(`https://localhost:7264/api/SeatReservations/${planeId}`)
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
        axios.post(`https://localhost:7264/api/SeatReservations/unreserve?planeId=${planeId}&userId=${userId}`, selectedSeats)
            .then(response => {
                if (response.status === 200) {
                    alert('Seats unreserved successfully!');
                    // Refresh seat data
                    axios.get(`https://localhost:7264/api/SeatReservations/${planeId}`)
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
        const leftSeats = seatsInRow.filter(seat => seat.column <= (row <= 3 || (planeId === 2 && row >= 1 && row <= 4) ? 'B' : 'C'));
        const rightSeats = seatsInRow.filter(seat => seat.column > (row <= 3 || (planeId === 2 && row >= 1 && row <= 4) ? 'B' : 'C'));

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
        <div>
            <h1>Select Your Seats</h1>
            <div className="seat-grid">
                {Object.keys(groupedSeats).map(row => {
                    const seatsInRow = groupedSeats[row];
                    if (planeId === 2) {
                        if (parseInt(row) === 33) {
                            // Plane 2 last row has only 3 seats on the right (D, E, F)
                            const rightSeats = seatsInRow.filter(seat => ['D', 'E', 'F'].includes(seat.column));
                            return renderSeats(row, rightSeats);
                        } else if (parseInt(row) >= 1 && parseInt(row) <= 4) {
                            // Plane 2 first 4 rows have only 2 seats each
                            const limitedSeats = seatsInRow.filter(seat => ['A', 'B', 'C', 'D'].includes(seat.column));
                            return renderSeats(row, limitedSeats);
                        }
                    }
                    return renderSeats(row, seatsInRow);
                })}
            </div>
            <button onClick={handleReserveSeats}>Reserve Seats</button>
            {userRole === 'staff' && (
                <>
                    <button onClick={handleLockSeats}>Lock Seats</button>
                    <button onClick={handleUnlockSeats}>Unlock Seats</button>
                    <button onClick={handleUnreserveSeats}>Unreserve Seats</button>
                </>
            )}
        </div>
    );
};

export default SeatSelection;
