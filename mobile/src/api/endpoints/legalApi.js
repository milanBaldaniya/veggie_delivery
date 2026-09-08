import axiosClient from '../axiosClient';

export const getLegalContent = (type) => axiosClient.get(`/legal/${type}`);
