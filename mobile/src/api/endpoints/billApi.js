import axiosClient from '../axiosClient';

export const getMyBills = () => axiosClient.get('/bills');

export const getMyBill = (id) => axiosClient.get(`/bills/${id}`);
