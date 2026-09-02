import { createBrowserRouter } from 'react-router';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { StudentDashboard } from './pages/StudentDashboard';
import { LecturerDashboard } from './pages/LecturerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { NotFound } from './pages/NotFound';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/login',
    element: <Login />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/student/*',
    element: (
      <ProtectedRoute allowedRoles={['student']}>
        <StudentDashboard />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/lecturer/*',
    element: (
      <ProtectedRoute allowedRoles={['lecturer']}>
        <LecturerDashboard />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/admin/*',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: '*',
    element: <NotFound />,
    errorElement: <ErrorBoundary />,
  },
]);

