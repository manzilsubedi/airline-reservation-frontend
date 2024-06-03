// services/bookingService.js
import axios from 'axios';

export const bookSeats = async (planeId, userId, selectedSeats) => {
    try {
        const response = await axios.post(`https://localhost:7264/api/SeatReservations/reserve`, { planeId, userId, selectedSeats });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const cancelBooking = async (planeId, userId, bookingId) => {
    try {
        const response = await axios.post(`https://localhost:7264/api/SeatReservations/cancel`, { planeId, userId, bookingId });
        return response.data;
    } catch (error) {
        throw error;
    }
};
