import axiosClient from '../axiosClient';

export const getProducts = () => axiosClient.get('/products');
