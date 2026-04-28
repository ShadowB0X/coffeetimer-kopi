import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ token, children, redirectTo = '/login' }) {
  const location = useLocation();

  if (!token) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  return children;
}