import axiosClient from '../axiosClient';

export const getSupport = () => axiosClient.get('/support');
