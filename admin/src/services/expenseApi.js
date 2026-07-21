import { baseApi } from './api';

export const expenseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getExpenses: builder.query({
      query: (params = {}) => ({ url: '/admin/expenses', params }),
      transformResponse: (res) => ({ expenses: res.data.expenses, totalAmount: res.data.totalAmount, meta: res.meta }),
      providesTags: [{ type: 'Expense', id: 'LIST' }],
    }),
    getExpenseSummary: builder.query({
      query: (params = {}) => ({ url: '/admin/expenses/summary', params }),
      transformResponse: (res) => res.data,
      providesTags: [{ type: 'Expense', id: 'SUMMARY' }],
    }),
    createExpense: builder.mutation({
      query: (body) => ({ url: '/admin/expenses', method: 'POST', body }),
      invalidatesTags: [{ type: 'Expense', id: 'LIST' }, { type: 'Expense', id: 'SUMMARY' }, 'Vendor'],
    }),
    updateExpense: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/expenses/${id}`, method: 'PUT', body }),
      invalidatesTags: [{ type: 'Expense', id: 'LIST' }, { type: 'Expense', id: 'SUMMARY' }],
    }),
    deleteExpense: builder.mutation({
      query: (id) => ({ url: `/admin/expenses/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Expense', id: 'LIST' }, { type: 'Expense', id: 'SUMMARY' }],
    }),
  }),
});

export const {
  useGetExpensesQuery,
  useGetExpenseSummaryQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} = expenseApi;
