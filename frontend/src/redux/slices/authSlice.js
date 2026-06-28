import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// ── Async Thunks ─────────────────────────────────────────
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', credentials);
      localStorage.setItem('token', data.token);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/register', userData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/auth/me');
      return data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const { data } = await api.put('/auth/update-profile', profileData);
      return data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// ── Slice ─────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:    null,
    token:   localStorage.getItem('token'),
    loading: false,
    error:   null,
    success: null,
  },
  reducers: {
    logout(state) {
      state.user  = null;
      state.token = null;
      localStorage.removeItem('token');
    },
    clearMessages(state) {
      state.error   = null;
      state.success = null;
    }
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(loginUser.fulfilled, (s, a) => {
        s.loading = false;
        s.user    = a.payload.user;
        s.token   = a.payload.token;
      })
      .addCase(loginUser.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })

    // Register
      .addCase(registerUser.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(registerUser.fulfilled, (s, a) => {
        s.loading = false;
        s.success = a.payload.message;
      })
      .addCase(registerUser.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })

    // Fetch Me
      .addCase(fetchMe.fulfilled, (s, a) => { s.user = a.payload; })
      .addCase(fetchMe.rejected,  (s) => {
        s.user  = null;
        s.token = null;
        localStorage.removeItem('token');
      })

    // Update Profile
      .addCase(updateProfile.fulfilled, (s, a) => { s.user = a.payload; });
  }
});

export const { logout, clearMessages } = authSlice.actions;
export default authSlice.reducer;