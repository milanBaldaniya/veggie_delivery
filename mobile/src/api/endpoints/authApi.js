import axiosClient from '../axiosClient';

export const sendOtp = (phone) => axiosClient.post('/auth/send-otp', { phone });

export const verifyOtp = (phone, otp) => axiosClient.post('/auth/verify-otp', { phone, otp });

export const refreshToken = (token) => axiosClient.post('/auth/refresh-token', { refreshToken: token });

export const getMe = () => axiosClient.get('/auth/me');

export const updateProfile = (payload) => axiosClient.put('/customers/me', payload);
