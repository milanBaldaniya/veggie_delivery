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
      // Cancelling an order recomputes its week's bill server-side, so the
      // Billing page's cache needs invalidating too, not just Order/Dashboard.
      // 'Bill' (unqualified, no id) is a type-wide wildcard: it invalidates the
      // bills LIST *and* any open bill-detail query, unlike { type:'Bill',
      // id:'LIST' } which only matches the list and leaves an open detail
      // drawer showing the pre-delete total.
      invalidatesTags: (r, e, arg) => [
        { type: 'Order', id: arg.id },
        { type: 'Order', id: 'LIST' },
        'Bill',
        'Dashboard',
      ],
    }),
    deleteOrder: builder.mutation({
      query: (id) => ({ url: `/admin/orders/${id}`, method: 'DELETE' }),
      // Deleting an order recomputes (or removes) its week's bill
      // server-side — invalidate Bill too, or the Billing page keeps
      // showing stale totals until a manual page reload.
      invalidatesTags: [{ type: 'Order', id: 'LIST' }, 'Bill', 'Dashboard'],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderQuery,
  useGetOrderBuildingsQuery,
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation,
} = orderApi;
