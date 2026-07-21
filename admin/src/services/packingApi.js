import { baseApi } from './api';

export const packingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPacking: builder.query({
      query: (date) => ({ url: '/admin/packing', params: date ? { date } : {} }),
      transformResponse: (res) => res.data,
      providesTags: [{ type: 'Packing', id: 'LIST' }],
    }),
    closeDay: builder.mutation({
      query: (body = {}) => ({ url: '/admin/packing/close-day', method: 'POST', body }),
      invalidatesTags: [{ type: 'Packing', id: 'LIST' }, { type: 'Order', id: 'LIST' }, 'Dashboard', 'Report'],
    }),
  }),
});

export const { useGetPackingQuery, useCloseDayMutation } = packingApi;
