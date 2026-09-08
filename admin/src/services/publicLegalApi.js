import { baseApi } from './api';

// Public read — same endpoint the mobile app uses (/legal/:type, no auth
// required). Used by the public-facing PublicLegalContent page.
export const publicLegalApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPublicLegalContent: builder.query({
      query: (type) => `/legal/${type}`,
      transformResponse: (res) => res.data.content,
    }),
  }),
});

export const { useGetPublicLegalContentQuery } = publicLegalApi;
