import { baseApi } from './api';

export const deliverySettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDeliverySettings: builder.query({
      query: () => '/admin/delivery-settings',
      transformResponse: (res) => res.data.settings,
      providesTags: ['Delivery'],
    }),
    updateDeliverySettings: builder.mutation({
      query: (body) => ({ url: '/admin/delivery-settings', method: 'PUT', body }),
      invalidatesTags: ['Delivery'],
    }),
  }),
});

export const { useGetDeliverySettingsQuery, useUpdateDeliverySettingsMutation } = deliverySettingsApi;
