import { Link, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AttendancePage from './pages/AttendancePage';
import ReportsPage from './pages/ReportsPage';
import StudentPage from './pages/StudentPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

function App() {
  const { user, logoutUser } = useAuth();

  return (
    <div className="app-container">
      <h1>Attendance Management System</h1>

      {user && (
        <div className="top-nav">
          <Link to="/dashboard">Dashboard</Link>
          {user.role === 'teacher' && (
            <>
              <Link to="/attendance">Attendance</Link>
              <Link to="/reports">Reports</Link>
            </>
          )}
          {user.role === 'student' && <Link to="/student">My Attendance</Link>}
          <button onClick={logoutUser}>Logout</button>
        </div>
      )}

      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <AttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
