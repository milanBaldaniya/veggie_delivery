import { baseApi } from './api';

export const uploadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Takes a FormData with an `image` file; fetchBaseQuery sets the multipart
    // boundary automatically when the body is FormData.
    uploadImage: builder.mutation({
      query: (formData) => ({ url: '/admin/uploads/image', method: 'POST', body: formData }),
      transformResponse: (res) => res.data,
    }),
  }),
});

export const { useUploadImageMutation } = uploadApi;
