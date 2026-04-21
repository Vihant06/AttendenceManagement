import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';

// Auth
import LoginPage from './pages/auth/LoginPage';
import Landing from './pages/Landing';

// Teacher pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherClasses from './pages/teacher/TeacherClasses';
import TeacherMarkAttendance from './pages/teacher/TeacherMarkAttendance';
import TeacherGeoSession from './pages/teacher/TeacherGeoSession';
import TeacherReports from './pages/teacher/TeacherReports';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentMarkAttendance from './pages/student/StudentMarkAttendance';
import StudentGeoMark from './pages/student/StudentGeoMark';

import './index.css';

function PortalLayout({ role, children }) {
  return (
    <div className="app-shell">
      <Sidebar role={role} />
      <main className="main-content">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login/:role" element={<LoginPage />} />

          {/* ── Teacher Portal (protected) ───────────────────────────── */}
          <Route path="/teacher" element={
            <ProtectedRoute requiredRole="teacher">
              <PortalLayout role="teacher"><TeacherDashboard /></PortalLayout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/classes" element={
            <ProtectedRoute requiredRole="teacher">
              <PortalLayout role="teacher"><TeacherClasses /></PortalLayout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/mark" element={
            <ProtectedRoute requiredRole="teacher">
              <PortalLayout role="teacher"><TeacherMarkAttendance /></PortalLayout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/geo" element={
            <ProtectedRoute requiredRole="teacher">
              <PortalLayout role="teacher"><TeacherGeoSession /></PortalLayout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/reports" element={
            <ProtectedRoute requiredRole="teacher">
              <PortalLayout role="teacher"><TeacherReports /></PortalLayout>
            </ProtectedRoute>
          } />

          {/* ── Student Portal (protected) ───────────────────────────── */}
          <Route path="/student" element={
            <ProtectedRoute requiredRole="student">
              <PortalLayout role="student"><StudentDashboard /></PortalLayout>
            </ProtectedRoute>
          } />
          <Route path="/student/attendance" element={
            <ProtectedRoute requiredRole="student">
              <PortalLayout role="student"><StudentAttendance /></PortalLayout>
            </ProtectedRoute>
          } />
          <Route path="/student/geo" element={
            <ProtectedRoute requiredRole="student">
              <PortalLayout role="student"><StudentGeoMark /></PortalLayout>
            </ProtectedRoute>
          } />
          <Route path="/student/mark" element={
            <ProtectedRoute requiredRole="student">
              <PortalLayout role="student"><StudentMarkAttendance /></PortalLayout>
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
