import { baseApi } from './api';

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query({
      // params: { page, limit, status, building, search, from, to }
      query: (params = {}) => ({ url: '/admin/orders', params }),
      // Keep the full envelope (orders + meta) for pagination.
      transformResponse: (res) => ({ orders: res.data.orders, meta: res.meta }),
      providesTags: (result) =>
        result
          ? [
              ...result.orders.map((o) => ({ type: 'Order', id: o.id })),
              { type: 'Order', id: 'LIST' },
            ]
          : [{ type: 'Order', id: 'LIST' }],
    }),
    getOrder: builder.query({
      query: (id) => `/admin/orders/${id}`,
      transformResponse: (res) => res.data.order,
      providesTags: (r, e, id) => [{ type: 'Order', id }],
    }),
    getOrderBuildings: builder.query({
      query: () => '/admin/orders/buildings',
      transformResponse: (res) => res.data.buildings,
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/admin/orders/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (r, e, arg) => [
        { type: 'Order', id: arg.id },
        { type: 'Order', id: 'LIST' },
        'Dashboard',
      ],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderQuery,
  useGetOrderBuildingsQuery,
  useUpdateOrderStatusMutation,
} = orderApi;
