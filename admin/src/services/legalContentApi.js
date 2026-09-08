import { baseApi } from './api';

export const legalContentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLegalContentList: builder.query({
      query: () => '/admin/legal-content',
      transformResponse: (res) => res.data.items,
      providesTags: ['LegalContent'],
    }),
    updateLegalContent: builder.mutation({
      query: ({ type, ...body }) => ({ url: `/admin/legal-content/${type}`, method: 'PUT', body }),
      invalidatesTags: ['LegalContent'],
    }),
  }),
});

export const { useGetLegalContentListQuery, useUpdateLegalContentMutation } = legalContentApi;
