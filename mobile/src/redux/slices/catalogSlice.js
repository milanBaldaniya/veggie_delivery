import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as catalogApi from '../../api/endpoints/catalogApi';

function extractErrorMessage(err) {
  return err.response?.data?.message || err.message || 'Something went wrong';
}

// page 1 replaces the list (fresh load / new search); page > 1 appends
// (infinite scroll). See extraReducers below for which one runs.
export const fetchProducts = createAsyncThunk(
  'catalog/fetchProducts',
  async ({ page = 1, search = '' } = {}, { rejectWithValue }) => {
    try {
      const { data } = await catalogApi.getProducts({ page, search, limit: 10 });
      return { ...data.data, search };
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

const initialState = {
  products: [],
  page: 1,
  hasMore: true,
  search: '',
  status: 'idle', // idle | loading | succeeded | error — initial/reset load
  loadingMore: false, // pagination (page > 1) load
  error: null,
};

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state, action) => {
        const isFirstPage = (action.meta.arg?.page || 1) === 1;
        if (isFirstPage) {
          state.status = 'loading';
          state.error = null;
        } else {
          state.loadingMore = true;
        }
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        const { products, page, hasMore, search } = action.payload;
        state.status = 'succeeded';
        state.loadingMore = false;
        state.page = page;
        state.hasMore = hasMore;
        state.search = search;
        state.products = page === 1 ? products : [...state.products, ...products];
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'error';
        state.loadingMore = false;
        state.error = action.payload;
      });
  },
});

export default catalogSlice.reducer;
