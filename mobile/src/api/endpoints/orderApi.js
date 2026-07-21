import axiosClient from '../axiosClient';

// items: [{ productId, grams }]
export const createOrder = (items) => axiosClient.post('/orders', { items });

export const getMyOrders = () => axiosClient.get('/orders');

export const getOrderWindow = () => axiosClient.get('/orders/window');
