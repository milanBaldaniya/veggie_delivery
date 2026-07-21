import { baseApi } from './api';

export const billingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBills: builder.query({
      query: (params = {}) => ({ url: '/admin/bills', params }),
      transformResponse: (res) => ({
        bills: res.data.bills,
        totals: res.data.totals,
        totalDue: res.data.totalDue,
        meta: res.meta,
      }),
      providesTags: [{ type: 'Bill', id: 'LIST' }],
    }),
    getBill: builder.query({
      query: (id) => ({ url: `/admin/bills/${id}` }),
      transformResponse: (res) => res.data.bill,
      providesTags: (r, e, id) => [{ type: 'Bill', id }],
    }),
    generateBills: builder.mutation({
      query: (body) => ({ url: '/admin/bills/generate', method: 'POST', body }),
      invalidatesTags: [{ type: 'Bill', id: 'LIST' }, 'Dashboard'],
    }),
    markBillPaid: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/bills/${id}/mark-paid`, method: 'PATCH', body }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Bill', id: 'LIST' }, { type: 'Bill', id }, 'Dashboard'],
    }),
    recordBillPayment: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/bills/${id}/pay`, method: 'PATCH', body }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Bill', id: 'LIST' }, { type: 'Bill', id }, 'Dashboard'],
    }),
  }),
});

export const {
  useGetBillsQuery,
  useGetBillQuery,
  useGenerateBillsMutation,
  useMarkBillPaidMutation,
  useRecordBillPaymentMutation,
} = billingApi;
