import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as buildingApi from '../../api/endpoints/buildingApi';

function extractErrorMessage(err) {
  return err.response?.data?.message || err.message || 'Something went wrong';
}

export const fetchBuildings = createAsyncThunk(
  'buildings/fetchBuildings',
  async ({ search = '' } = {}, { rejectWithValue }) => {
    try {
      const { data } = await buildingApi.getBuildings({ search });
      return { buildings: data.data.buildings, search };
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

const initialState = {
  buildings: [],
  search: '',
  status: 'idle', // idle | loading | succeeded | error
  error: null,
};

const buildingsSlice = createSlice({
  name: 'buildings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBuildings.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchBuildings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.buildings = action.payload.buildings;
        state.search = action.payload.search;
      })
      .addCase(fetchBuildings.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload;
      });
  },
});

export default buildingsSlice.reducer;
