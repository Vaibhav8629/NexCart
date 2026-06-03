import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
  const { loading, isAdmin } = useAuth();

  if (loading) {
    return <div className="grid min-h-screen place-items-center text-slate-300">Checking admin access...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}