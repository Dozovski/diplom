import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Автоматически добавляем токен к каждому запросу
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Auth ────────────────────────────────────────────────────────────────
export const register = (data) => api.post('/register', data);
export const login = (data) => api.post('/login', data);
export const logout = () => api.post('/logout');
export const getMe = () => api.get('/me');
export const getProfile = () => api.get('/profile');
export const updateProfile = (data) => api.put('/profile', data);

// ─── Cars ───────────────────────────────────────────────────────────────
export const getCars = (params = {}) => api.get('/cars', { params });
export const getCar = (id) => api.get(`/cars/${id}`);
export const createCar = (data) => api.post('/cars', data);
export const updateCar = (id, data) => api.put(`/cars/${id}`, data);
export const deleteCar = (id) => api.delete(`/cars/${id}`);

// ─── Bookings ───────────────────────────────────────────────────────────
export const getBookings = (params = {}) => api.get('/bookings', { params });
export const createBooking = (data) => api.post('/bookings', data);
export const getMyBookings = () => api.get('/my-bookings');
export const updateBookingStatus = (id, status) => api.patch(`/bookings/${id}`, { status });
export const updateCarAvailability = (id, available) => api.patch(`/cars/${id}/availability`, { available });

// ─── Reviews ────────────────────────────────────────────────────────────
export const getReviews = () => api.get('/reviews');
export const createReview = (data) => api.post('/reviews', data);

// ─── Contact ────────────────────────────────────────────────────────────
export const sendContactMessage = (data) => api.post('/contact', data);

export default api;