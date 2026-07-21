import { baseApi } from './api';

export const salaryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSalaries: builder.query({
      query: (params = {}) => ({ url: '/admin/salaries', params }),
      transformResponse: (res) => res.data.salaries,
      providesTags: [{ type: 'Salary', id: 'LIST' }],
    }),
    getEligibleStaff: builder.query({
      query: () => '/admin/salaries/staff',
      transformResponse: (res) => res.data.staff,
    }),
    createSalary: builder.mutation({
      query: (body) => ({ url: '/admin/salaries', method: 'POST', body }),
      invalidatesTags: [{ type: 'Salary', id: 'LIST' }],
    }),
    updateSalary: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/salaries/${id}`, method: 'PUT', body }),
      invalidatesTags: [{ type: 'Salary', id: 'LIST' }],
    }),
    paySalary: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/salaries/${id}/pay`, method: 'PATCH', body }),
      invalidatesTags: [{ type: 'Salary', id: 'LIST' }],
    }),
    deleteSalary: builder.mutation({
      query: (id) => ({ url: `/admin/salaries/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Salary', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetSalariesQuery,
  useGetEligibleStaffQuery,
  useCreateSalaryMutation,
  useUpdateSalaryMutation,
  usePaySalaryMutation,
  useDeleteSalaryMutation,
} = salaryApi;
