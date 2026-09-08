import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as legalApi from '../../api/endpoints/legalApi';

function extractErrorMessage(err) {
  return err.response?.data?.message || err.message || 'Something went wrong';
}

// Each of the 4 legal documents is fetched independently as its screen is
// opened, so state is keyed by type rather than a single settings object.
export const fetchLegalContent = createAsyncThunk(
  'legal/fetchLegalContent',
  async (type, { rejectWithValue }) => {
    try {
      const { data } = await legalApi.getLegalContent(type);
      return { type, content: data.data.content };
    } catch (err) {
      return rejectWithValue({ type, message: extractErrorMessage(err) });
    }
  }
);

const initialState = {
  byType: {}, // { [type]: { content, status: idle|loading|succeeded|error, error } }
};

function entryFor(state, type) {
  if (!state.byType[type]) {
    state.byType[type] = { content: null, status: 'idle', error: null };
  }
  return state.byType[type];
}

const legalSlice = createSlice({
  name: 'legal',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLegalContent.pending, (state, action) => {
        const entry = entryFor(state, action.meta.arg);
        entry.status = 'loading';
        entry.error = null;
      })
      .addCase(fetchLegalContent.fulfilled, (state, action) => {
        const entry = entryFor(state, action.payload.type);
        entry.status = 'succeeded';
        entry.content = action.payload.content;
      })
      .addCase(fetchLegalContent.rejected, (state, action) => {
        const type = action.meta.arg;
        const entry = entryFor(state, type);
        entry.status = 'error';
        entry.error = action.payload?.message || 'Something went wrong';
      });
  },
});

export default legalSlice.reducer;
