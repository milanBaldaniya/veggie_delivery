import { baseApi } from './api';

export const vendorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVendors: builder.query({
      query: (params = {}) => ({ url: '/admin/vendors', params }),
      transformResponse: (res) => res.data.vendors,
      providesTags: [{ type: 'Vendor', id: 'LIST' }],
    }),
    createVendor: builder.mutation({
      query: (body) => ({ url: '/admin/vendors', method: 'POST', body }),
      invalidatesTags: [{ type: 'Vendor', id: 'LIST' }],
    }),
    updateVendor: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/vendors/${id}`, method: 'PUT', body }),
      invalidatesTags: [{ type: 'Vendor', id: 'LIST' }],
    }),
    deleteVendor: builder.mutation({
      query: (id) => ({ url: `/admin/vendors/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Vendor', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetVendorsQuery,
  useCreateVendorMutation,
  useUpdateVendorMutation,
  useDeleteVendorMutation,
} = vendorApi;
