import { configureStore } from '@reduxjs/toolkit';
import authReducer     from './slices/authSlice';
import resumeReducer   from './slices/resumeSlice';
 import githubReducer   from './slices/githubSlice';
import roadmapReducer  from './slices/roadmapSlice';
import jobReducer      from './slices/jobSlice';

export const store = configureStore({
  reducer: {
    auth:    authReducer,
    resume:  resumeReducer,
    github:  githubReducer,
    roadmap: roadmapReducer,
    jobs:    jobReducer,
  },
});