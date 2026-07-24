import axiosClient from '../axiosClient';

export const getProducts = (params) => axiosClient.get('/products', { params });
