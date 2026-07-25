import { baseApi } from './api';

export const supportSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSupportSettings: builder.query({
      query: () => '/admin/support-settings',
      transformResponse: (res) => res.data.settings,
      providesTags: ['Support'],
    }),
    updateSupportSettings: builder.mutation({
      query: (body) => ({ url: '/admin/support-settings', method: 'PUT', body }),
      invalidatesTags: ['Support'],
    }),
  }),
});

export const { useGetSupportSettingsQuery, useUpdateSupportSettingsMutation } = supportSettingsApi;
