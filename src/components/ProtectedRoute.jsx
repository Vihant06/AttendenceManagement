import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

/**
 * ProtectedRoute — wraps a route element, redirects to login if not authenticated.
 * requiredRole: 'teacher' | 'student' — enforces role match too.
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const { state } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, role } = state.auth;

  useEffect(() => {
    if (state.authLoading) return; // Wait for Firebase to initialize
    if (!isLoggedIn) {
      const loginPath = requiredRole ? `/login/${requiredRole}` : '/';
      navigate(loginPath, { state: { from: location }, replace: true });
    } else if (requiredRole && role !== requiredRole) {
      navigate(`/${role}`, { replace: true });
    }
  }, [isLoggedIn, role, requiredRole, state.authLoading]);

  // While redirecting or loading, render nothing
  if (state.authLoading) return null;
  if (!isLoggedIn) return null;
  if (requiredRole && role !== requiredRole) return null;

  return children;
}

