import { baseApi } from './api';

export const watchmanApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWatchmen: builder.query({
      query: (params = {}) => ({ url: '/admin/watchmen', params }),
      transformResponse: (res) => res.data.watchmen,
      providesTags: [{ type: 'Watchman', id: 'LIST' }],
    }),
    createWatchman: builder.mutation({
      query: (body) => ({ url: '/admin/watchmen', method: 'POST', body }),
      invalidatesTags: [{ type: 'Watchman', id: 'LIST' }, 'Dashboard'],
    }),
    updateWatchman: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/watchmen/${id}`, method: 'PUT', body }),
      invalidatesTags: [{ type: 'Watchman', id: 'LIST' }],
    }),
    deleteWatchman: builder.mutation({
      query: (id) => ({ url: `/admin/watchmen/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Watchman', id: 'LIST' }, { type: 'Building', id: 'LIST' }, 'Dashboard'],
    }),
  }),
});

export const {
  useGetWatchmenQuery,
  useCreateWatchmanMutation,
  useUpdateWatchmanMutation,
  useDeleteWatchmanMutation,
} = watchmanApi;
