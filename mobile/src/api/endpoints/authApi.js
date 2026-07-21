import axiosClient from '../axiosClient';

export const googleLogin = (idToken) => axiosClient.post('/auth/google', { idToken });

export const refreshToken = (token) => axiosClient.post('/auth/refresh-token', { refreshToken: token });

export const getMe = () => axiosClient.get('/auth/me');

export const updateProfile = (payload) => axiosClient.put('/customers/me', payload);
