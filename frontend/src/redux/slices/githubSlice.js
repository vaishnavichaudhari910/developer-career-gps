import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const analyzeGitHub = createAsyncThunk(
  'github/analyze',
  async (username, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/github/analyze', { username });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Analysis failed');
    }
  }
);

export const fetchGitHubData = createAsyncThunk(
  'github/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/github/my');
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

const githubSlice = createSlice({
  name: 'github',
  initialState: { data: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(analyzeGitHub.pending,     (s) => { s.loading = true;  s.error = null; })
      .addCase(analyzeGitHub.fulfilled,   (s, a) => { s.loading = false; s.data = a.payload; })
      .addCase(analyzeGitHub.rejected,    (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchGitHubData.fulfilled, (s, a) => { s.data = a.payload; });
  }
});

export default githubSlice.reducer;