import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authApi from '../../api/endpoints/authApi';
import { signInWithGoogle, signOutFromGoogle } from '../../services/googleAuth';

function extractErrorMessage(err) {
  return err.response?.data?.message || err.message || 'Something went wrong';
}

// Runs the native Google flow, then exchanges the ID token for our own JWTs.
// Rejects with `null` on user cancellation so the UI can quietly stand down.
export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (_, { rejectWithValue }) => {
    try {
      const idToken = await signInWithGoogle();
      if (!idToken) return rejectWithValue(null);
      const { data } = await authApi.googleLogin(idToken);
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
  user: null, // { id, name, phone, email, avatar, role, building, wing, flat, status, isProfileComplete }
  token: null,
  refreshToken: null,
  isAuthenticated: false,

  loginStatus: 'idle', // idle | loading | error
  loginError: null,
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
    logout(state) {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.loginStatus = 'idle';
      state.loginError = null;
      // Clear the cached Google session too, so the next login re-prompts.
      signOutFromGoogle();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(googleLogin.pending, (state) => {
        state.loginStatus = 'loading';
        state.loginError = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loginStatus = 'idle';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        // `null` payload == user cancelled; keep the screen quiet in that case.
        state.loginStatus = action.payload ? 'error' : 'idle';
        state.loginError = action.payload || null;
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

export const { setCredentials, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;
