import axiosClient from '../axiosClient';

export const getBuildings = (params) => axiosClient.get('/buildings', { params });
