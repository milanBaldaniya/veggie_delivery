import { baseApi } from './api';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: (params = {}) => ({ url: '/admin/users', params }),
      transformResponse: (res) => ({ users: res.data.users, meta: res.meta }),
      providesTags: [{ type: 'User', id: 'LIST' }],
    }),
    getUser: builder.query({
      query: (id) => `/admin/users/${id}`,
      transformResponse: (res) => res.data,
      providesTags: (r, e, id) => [{ type: 'User', id }],
    }),
    setUserStatus: builder.mutation({
      query: ({ id, status }) => ({ url: `/admin/users/${id}/status`, method: 'PATCH', body: { status } }),
      invalidatesTags: (r, e, arg) => [{ type: 'User', id: 'LIST' }, { type: 'User', id: arg.id }],
    }),
  }),
});

export const { useGetUsersQuery, useGetUserQuery, useSetUserStatusMutation } = userApi;
