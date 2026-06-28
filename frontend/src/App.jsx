import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { fetchMe } from './redux/slices/authSlice';

// Pages
import Landing       from './pages/Landing';
import Login         from './pages/auth/Login';
import Register      from './pages/auth/Register';
import Dashboard     from './pages/dashboard/Dashboard';
import ResumePage    from './pages/dashboard/ResumePage';
import GitHubPage    from './pages/dashboard/GitHubPage';
import RoadmapPage   from './pages/dashboard/RoadmapPage';
import JobsPage      from './pages/dashboard/JobsPage';
import CoachPage     from './pages/dashboard/CoachPage';
import InterviewPage from './pages/dashboard/InterviewPage';
import ProjectsPage  from './pages/dashboard/ProjectsPage';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';
import PrivateRoute    from './routes/PrivateRoute';

export default function App() {
  const dispatch = useDispatch();
  const { token } = useSelector(state => state.auth);

  useEffect(() => {
    if (token) dispatch(fetchMe());
  }, [token]);

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        {/* Public */}
        <Route path="/"         element={<Landing />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected — wrapped in DashboardLayout */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }>
          <Route index           element={<Dashboard />} />
          <Route path="resume"   element={<ResumePage />} />
          <Route path="github"   element={<GitHubPage />} />
          <Route path="roadmap"  element={<RoadmapPage />} />
          <Route path="jobs"     element={<JobsPage />} />
          <Route path="coach"    element={<CoachPage />} />
          <Route path="interview" element={<InterviewPage />} />
          <Route path="projects" element={<ProjectsPage />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}