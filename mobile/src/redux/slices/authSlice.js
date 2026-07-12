import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authApi from '../../api/endpoints/authApi';

function extractErrorMessage(err) {
  return err.response?.data?.message || err.message || 'Something went wrong';
}

export const sendOtp = createAsyncThunk('auth/sendOtp', async (phone, { rejectWithValue }) => {
  try {
    await authApi.sendOtp(phone);
    return phone;
  } catch (err) {
    return rejectWithValue(extractErrorMessage(err));
  }
});

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async ({ phone, otp }, { rejectWithValue }) => {
    try {
      const { data } = await authApi.verifyOtp(phone, otp);
      return data.data;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const { data } = await authApi.getMe();
    return data.data.user;
  } catch (err) {
    return rejectWithValue(extractErrorMessage(err));
  }
});

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await authApi.updateProfile(payload);
      return data.data.user;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

const initialState = {
  user: null, // { id, name, phone, role, building, wing, flat, status, isProfileComplete }
  token: null,
  refreshToken: null,
  isAuthenticated: false,

  phone: null,
  otpStatus: 'idle', // idle | loading | sent | error
  otpError: null,
  verifyStatus: 'idle', // idle | loading | error
  verifyError: null,
  profileStatus: 'idle', // idle | loading | error
  profileError: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { user, token, refreshToken } = action.payload;
      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
    },
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload };
    },
    resetOtpFlow(state) {
      state.phone = null;
      state.otpStatus = 'idle';
      state.otpError = null;
      state.verifyStatus = 'idle';
      state.verifyError = null;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendOtp.pending, (state) => {
        state.otpStatus = 'loading';
        state.otpError = null;
      })
      .addCase(sendOtp.fulfilled, (state, action) => {
        state.otpStatus = 'sent';
        state.phone = action.payload;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.otpStatus = 'error';
        state.otpError = action.payload;
      })

      .addCase(verifyOtp.pending, (state) => {
        state.verifyStatus = 'loading';
        state.verifyError = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.verifyStatus = 'idle';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.verifyStatus = 'error';
        state.verifyError = action.payload;
      })

      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
      })

      .addCase(updateProfile.pending, (state) => {
        state.profileStatus = 'loading';
        state.profileError = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profileStatus = 'idle';
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.profileStatus = 'error';
        state.profileError = action.payload;
      });
  },
});

export const { setCredentials, updateUser, resetOtpFlow, logout } = authSlice.actions;
export default authSlice.reducer;
