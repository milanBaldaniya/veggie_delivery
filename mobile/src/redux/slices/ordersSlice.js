import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as orderApi from '../../api/endpoints/orderApi';

function extractErrorMessage(err) {
  return err.response?.data?.message || err.message || 'Something went wrong';
}

// Accepts cart lines and sends only what the server needs ({ productId, grams }).
export const placeOrder = createAsyncThunk(
  'orders/placeOrder',
  async (cartItems, { rejectWithValue }) => {
    try {
      const items = cartItems.map((i) => ({ productId: i.productId, grams: i.grams }));
      const { data } = await orderApi.createOrder(items);
      return data.data.order;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

export const fetchOrders = createAsyncThunk('orders/fetchOrders', async (_, { rejectWithValue }) => {
  try {
    const { data } = await orderApi.getMyOrders();
    return data.data.orders;
  } catch (err) {
    return rejectWithValue(extractErrorMessage(err));
  }
});

// The daily order cutoff is owned by the server; the app just reflects it.
export const fetchOrderWindow = createAsyncThunk(
  'orders/fetchOrderWindow',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await orderApi.getOrderWindow();
      return data.data.window;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

const initialState = {
  list: [],
  listStatus: 'idle', // idle | loading | succeeded | error
  placeStatus: 'idle', // idle | loading | error
  error: null,
  // { isOpen, message, cutoffLabel } — defaults to open so the UI never blocks
  // ordering before the first fetch resolves.
  window: { isOpen: true, message: null, cutoffLabel: null },
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    resetPlaceStatus(state) {
      state.placeStatus = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeOrder.pending, (state) => {
        state.placeStatus = 'loading';
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.placeStatus = 'idle';
        state.list.unshift(action.payload);
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.placeStatus = 'error';
        state.error = action.payload;
      })

      .addCase(fetchOrders.pending, (state) => {
        state.listStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.listStatus = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.listStatus = 'error';
        state.error = action.payload;
      })

      .addCase(fetchOrderWindow.fulfilled, (state, action) => {
        state.window = action.payload;
      });
  },
});

export const { resetPlaceStatus } = ordersSlice.actions;
export default ordersSlice.reducer;
