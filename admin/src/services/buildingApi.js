import { baseApi } from './api';

export const buildingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBuildings: builder.query({
      query: (params = {}) => ({ url: '/admin/buildings', params }),
      transformResponse: (res) => res.data.buildings,
      providesTags: [{ type: 'Building', id: 'LIST' }],
    }),
    getBuildingStats: builder.query({
      query: (id) => `/admin/buildings/${id}/stats`,
      transformResponse: (res) => res.data,
    }),
    createBuilding: builder.mutation({
      query: (body) => ({ url: '/admin/buildings', method: 'POST', body }),
      invalidatesTags: [{ type: 'Building', id: 'LIST' }, 'Dashboard'],
    }),
    updateBuilding: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/buildings/${id}`, method: 'PUT', body }),
      invalidatesTags: [{ type: 'Building', id: 'LIST' }],
    }),
    assignWatchman: builder.mutation({
      query: ({ id, watchmanId }) => ({
        url: `/admin/buildings/${id}/watchman`,
        method: 'PATCH',
        body: { watchmanId },
      }),
      invalidatesTags: [{ type: 'Building', id: 'LIST' }, { type: 'Watchman', id: 'LIST' }],
    }),
    deleteBuilding: builder.mutation({
      query: (id) => ({ url: `/admin/buildings/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Building', id: 'LIST' }, 'Dashboard'],
    }),
  }),
});

export const {
  useGetBuildingsQuery,
  useGetBuildingStatsQuery,
  useCreateBuildingMutation,
  useUpdateBuildingMutation,
  useAssignWatchmanMutation,
  useDeleteBuildingMutation,
} = buildingApi;
