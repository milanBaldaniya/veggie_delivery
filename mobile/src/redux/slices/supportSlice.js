import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as supportApi from '../../api/endpoints/supportApi';

function extractErrorMessage(err) {
  return err.response?.data?.message || err.message || 'Something went wrong';
}

export const fetchSupport = createAsyncThunk('support/fetchSupport', async (_, { rejectWithValue }) => {
  try {
    const { data } = await supportApi.getSupport();
    return data.data.settings;
  } catch (err) {
    return rejectWithValue(extractErrorMessage(err));
  }
});

const initialState = {
  settings: null,
  status: 'idle', // idle | loading | succeeded | error
  error: null,
};

const supportSlice = createSlice({
  name: 'support',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSupport.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchSupport.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.settings = action.payload;
      })
      .addCase(fetchSupport.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload;
      });
  },
});

export default supportSlice.reducer;
