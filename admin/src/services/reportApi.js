import { baseApi } from './api';

export const reportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDailyPurchase: builder.query({
      query: (date) => ({ url: '/admin/reports/daily-purchase', params: date ? { date } : {} }),
      transformResponse: (res) => res.data,
      providesTags: ['Report'],
    }),
    getSalesReport: builder.query({
      query: (params = {}) => ({ url: '/admin/reports/sales', params }),
      transformResponse: (res) => res.data,
      providesTags: ['Report'],
    }),
    getBuildingWiseSales: builder.query({
      query: (params = {}) => ({ url: '/admin/reports/building-wise', params }),
      transformResponse: (res) => res.data.rows,
      providesTags: ['Report'],
    }),
    getProductConsumption: builder.query({
      query: (params = {}) => ({ url: '/admin/reports/product-consumption', params }),
      transformResponse: (res) => res.data.rows,
      providesTags: ['Report'],
    }),
    getProfitLoss: builder.query({
      query: (params = {}) => ({ url: '/admin/reports/profit-loss', params }),
      transformResponse: (res) => res.data,
      providesTags: ['Report'],
    }),
  }),
});

export const {
  useGetDailyPurchaseQuery,
  useGetSalesReportQuery,
  useGetBuildingWiseSalesQuery,
  useGetProductConsumptionQuery,
  useGetProfitLossQuery,
} = reportApi;
