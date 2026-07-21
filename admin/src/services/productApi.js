import { baseApi } from './api';

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: (params = {}) => ({ url: '/admin/products', params }),
      transformResponse: (res) => res.data.products,
      providesTags: (result) =>
        result
          ? [...result.map((p) => ({ type: 'Product', id: p.id })), { type: 'Product', id: 'LIST' }]
          : [{ type: 'Product', id: 'LIST' }],
    }),
    createProduct: builder.mutation({
      query: (body) => ({ url: '/admin/products', method: 'POST', body }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }, 'Dashboard'],
    }),
    updateProduct: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/products/${id}`, method: 'PUT', body }),
      invalidatesTags: (r, e, arg) => [{ type: 'Product', id: arg.id }, { type: 'Product', id: 'LIST' }],
    }),
    toggleProduct: builder.mutation({
      query: ({ id, inStock }) => ({
        url: `/admin/products/${id}/toggle`,
        method: 'PATCH',
        body: { inStock },
      }),
      // Optimistic update so the switch flips instantly.
      async onQueryStarted({ id, inStock }, { dispatch, queryFulfilled, getState }) {
        const patches = [];
        for (const { endpointName, originalArgs } of productApi.util.selectInvalidatedBy(getState(), [
          { type: 'Product', id: 'LIST' },
        ])) {
          if (endpointName !== 'getProducts') continue;
          patches.push(
            dispatch(
              productApi.util.updateQueryData('getProducts', originalArgs, (draft) => {
                const item = draft.find((p) => p.id === id);
                if (item) item.inStock = inStock;
              })
            )
          );
        }
        try {
          await queryFulfilled;
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
      invalidatesTags: (r, e, arg) => [{ type: 'Product', id: arg.id }],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({ url: `/admin/products/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }, 'Dashboard'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useToggleProductMutation,
  useDeleteProductMutation,
} = productApi;
