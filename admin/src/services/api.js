import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout } from '../features/auth/authSlice';

// Dev uses the Vite proxy (relative path, see vite.config.js); a production
// build has no dev server to proxy through, so it needs the live backend's
// absolute URL, injected via VITE_API_BASE_URL at build time.
const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || '/api/v1',
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
    'Support',
    'Delivery',
  ],
  endpoints: () => ({}),
});
