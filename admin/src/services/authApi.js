import { baseApi } from './api';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (body) => ({ url: '/admin/auth/login', method: 'POST', body }),
      transformResponse: (res) => res.data,
    }),
    getMe: builder.query({
      query: () => '/admin/auth/me',
      transformResponse: (res) => res.data.user,
    }),
  }),
});

export const { useLoginMutation, useGetMeQuery } = authApi;
