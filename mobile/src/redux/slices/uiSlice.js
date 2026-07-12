import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  globalLoading: false,
  isOnline: true,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setGlobalLoading(state, action) {
      state.globalLoading = action.payload;
    },
    setOnline(state, action) {
      state.isOnline = action.payload;
    },
  },
});

export const { setGlobalLoading, setOnline } = uiSlice.actions;
export default uiSlice.reducer;
