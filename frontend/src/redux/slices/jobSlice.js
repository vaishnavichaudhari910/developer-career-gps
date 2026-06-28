import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchMatchedJobs = createAsyncThunk(
  'jobs/fetchMatched',
  async (role = '', { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/jobs/matched${role ? `?role=${role}` : ''}`);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const fetchSavedJobs = createAsyncThunk(
  'jobs/fetchSaved',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/jobs/saved');
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const fetchApplications = createAsyncThunk(
  'jobs/fetchApplications',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/jobs/applications');
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

const jobSlice = createSlice({
  name: 'jobs',
  initialState: {
    matched:      [],
    saved:        [],
    applications: [],
    loading:      false,
    error:        null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMatchedJobs.pending,      (s) => { s.loading = true; })
      .addCase(fetchMatchedJobs.fulfilled,    (s, a) => { s.loading = false; s.matched = a.payload; })
      .addCase(fetchMatchedJobs.rejected,     (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchSavedJobs.fulfilled,      (s, a) => { s.saved = a.payload; })
      .addCase(fetchApplications.fulfilled,   (s, a) => { s.applications = a.payload; });
  }
});

export default jobSlice.reducer;