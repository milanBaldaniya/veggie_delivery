import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as catalogApi from '../../api/endpoints/catalogApi';

function extractErrorMessage(err) {
  return err.response?.data?.message || err.message || 'Something went wrong';
}

export const fetchProducts = createAsyncThunk(
  'catalog/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await catalogApi.getProducts();
      return data.data.products;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

const initialState = {
  products: [],
  status: 'idle', // idle | loading | succeeded | error
  error: null,
};

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload;
      });
  },
});

export default catalogSlice.reducer;
