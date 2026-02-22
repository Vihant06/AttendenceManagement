import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="card">
      <h2>Dashboard</h2>
      <p>Welcome, {user?.name}</p>
      <p>Your role: <strong>{user?.role}</strong></p>
      <p>Use the navigation links at the top to continue.</p>
    </div>
  );
};

export default DashboardPage;
