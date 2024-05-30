// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'https://localhost:7264/api/SeatReservations';
const API_URL = 'https://localhost:7264/api';

// Set up axios instance with interceptors
const axiosInstance = axios.create({
    baseURL: API_URL,
  });

axiosInstance.interceptors.request.use(
    config => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    error => Promise.reject(error)
  );

  export const login = async (email, password) => {
    try {
      const response = await axiosInstance.post('/Auth/login', { email, password });
      // Save token to localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role); 
      return response.data;
    } catch (error) {
      console.error('Login failed', error.response ? error.response.data : error.message);
    }
  };

  export const logout = async (userId) => {
    try {
        // Call backend to unlock all seats locked by the user
        await axiosInstance.post('/SeatReservations/unlockAll', { userId });

        // Remove token and role from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('role');
    } catch (error) {
        console.error('Logout failed', error.response ? error.response.data : error.message);
    }
};
  

  export const register = async (email, password) => {
    try {
      const response = await axiosInstance.post('/Auth/register', { email, password });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  };
  
export const getSeats = (planeId) => {
    return axios.get(`${API_BASE_URL}/${planeId}`);
};

export const reserveSeats = (planeId, seatIds, userId) => {
    return axios.post(`${API_BASE_URL}/reserve`, { planeId, seatIds, userId });
};

export const lockSeats = (planeId, seatIds, userId) => {
    return axios.post(`${API_BASE_URL}/lock`, { planeId, seatIds, userId });
};
