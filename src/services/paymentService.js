// services/paymentService.js
import axios from 'axios';

export const processPayment = async (userId, amount) => {
    try {
        const response = await axios.post(`https://localhost:7264/api/Payments/process`, { userId, amount });
        return response.data;
    } catch (error) {
        throw error;
    }
};
