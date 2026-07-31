import { baseApi } from './api';

export const appDownloadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDownloadQr: builder.query({
      query: () => '/admin/app-download/qr',
      transformResponse: (res) => res.data,
    }),
  }),
});

export const { useGetDownloadQrQuery } = appDownloadApi;
