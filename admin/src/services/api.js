import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout } from '../features/auth/authSlice';

// Base query attaches the bearer token from auth state to every request.
const rawBaseQuery = fetchBaseQuery({
  baseUrl: '/api/v1',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

// Wrapper: on a 401 (expired/invalid token) log the user out globally so the
// router bounces them to /login instead of leaving stale, broken screens.
const baseQueryWithAuth = async (args, apiCtx, extraOptions) => {
  const result = await rawBaseQuery(args, apiCtx, extraOptions);
  if (result.error?.status === 401) {
    apiCtx.dispatch(logout());
  }
  return result;
};

// Single base API; every feature module extends it via injectEndpoints so the
// store only ever holds one API slice/reducer/middleware.
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuth,
  // Central cache-tag registry for cross-module invalidation.
  tagTypes: [
    'Dashboard',
    'Product',
    'Order',
    'Report',
    'Building',
    'Watchman',
    'User',
    'Vendor',
    'Expense',
    'Salary',
    'Bill',
    'Packing',
  ],
  endpoints: () => ({}),
});
