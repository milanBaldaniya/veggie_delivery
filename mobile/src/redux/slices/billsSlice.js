import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as billApi from '../../api/endpoints/billApi';

function extractErrorMessage(err) {
  return err.response?.data?.message || err.message || 'Something went wrong';
}

export const fetchBills = createAsyncThunk('bills/fetchBills', async (_, { rejectWithValue }) => {
  try {
    const { data } = await billApi.getMyBills();
    return data.data; // { bills, totalDue }
  } catch (err) {
    return rejectWithValue(extractErrorMessage(err));
  }
});

// Full billing card (incl. the week's order snapshots) for the details screen.
export const fetchBill = createAsyncThunk('bills/fetchBill', async (id, { rejectWithValue }) => {
  try {
    const { data } = await billApi.getMyBill(id);
    return data.data.bill;
  } catch (err) {
    return rejectWithValue(extractErrorMessage(err));
  }
});

const initialState = {
  list: [],
  totalDue: 0,
  listStatus: 'idle', // idle | loading | succeeded | error
  error: null,
  current: null,
  currentStatus: 'idle', // idle | loading | succeeded | error
};

const billsSlice = createSlice({
  name: 'bills',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBills.pending, (state) => {
        state.listStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchBills.fulfilled, (state, action) => {
        state.listStatus = 'succeeded';
        state.list = action.payload.bills;
        state.totalDue = action.payload.totalDue;
      })
      .addCase(fetchBills.rejected, (state, action) => {
        state.listStatus = 'error';
        state.error = action.payload;
      })

      .addCase(fetchBill.pending, (state) => {
        state.currentStatus = 'loading';
      })
      .addCase(fetchBill.fulfilled, (state, action) => {
        state.currentStatus = 'succeeded';
        state.current = action.payload;
      })
      .addCase(fetchBill.rejected, (state, action) => {
        state.currentStatus = 'error';
        state.error = action.payload;
      });
  },
});

// A bill's full detail (incl. payments) already lives in the list response, so
// the details screen selects from here by id rather than refetching.
export const selectBillById = (id) => (state) => state.bills.list.find((b) => b.id === id);

export default billsSlice.reducer;
