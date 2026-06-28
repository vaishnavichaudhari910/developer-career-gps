import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const uploadResume = createAsyncThunk(
  'resume/upload',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Upload failed');
    }
  }
);

export const fetchMyResumes = createAsyncThunk(
  'resume/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/resume/my');
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

const resumeSlice = createSlice({
  name: 'resume',
  initialState: {
    resumes:  [],
    current:  null,
    loading:  false,
    error:    null,
    success:  null,
  },
  reducers: {
    clearResumeMessages(state) {
      state.error   = null;
      state.success = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadResume.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(uploadResume.fulfilled, (s, a) => {
        s.loading = false;
        s.current = a.payload;
        s.resumes.unshift(a.payload);
        s.success = 'Resume analyzed successfully!';
      })
      .addCase(uploadResume.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchMyResumes.fulfilled, (s, a) => { s.resumes = a.payload; });
  }
});

export const { clearResumeMessages } = resumeSlice.actions;
export default resumeSlice.reducer;