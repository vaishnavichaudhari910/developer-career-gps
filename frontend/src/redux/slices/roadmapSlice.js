import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const createRoadmap = createAsyncThunk(
  'roadmap/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/roadmap/create', payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed');
    }
  }
);

export const fetchMyRoadmaps = createAsyncThunk(
  'roadmap/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/roadmap/my');
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const analyzeSkillGap = createAsyncThunk(
  'roadmap/skillGap',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/roadmap/skill-gap', payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

const roadmapSlice = createSlice({
  name: 'roadmap',
  initialState: {
    roadmaps:  [],
    current:   null,
    skillGap:  null,
    loading:   false,
    error:     null,
    success:   null,
  },
  reducers: {
    setCurrentRoadmap(state, action) { state.current = action.payload; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createRoadmap.pending,    (s) => { s.loading = true;  s.error = null; })
      .addCase(createRoadmap.fulfilled,  (s, a) => {
        s.loading = false;
        s.current = a.payload;
        s.roadmaps.unshift(a.payload);
        s.success = 'Roadmap created!';
      })
      .addCase(createRoadmap.rejected,   (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchMyRoadmaps.fulfilled,(s, a) => { s.roadmaps = a.payload; })
      .addCase(analyzeSkillGap.fulfilled,(s, a) => { s.skillGap = a.payload; });
  }
});

export const { setCurrentRoadmap } = roadmapSlice.actions;
export default roadmapSlice.reducer;