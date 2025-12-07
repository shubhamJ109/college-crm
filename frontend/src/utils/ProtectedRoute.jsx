import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token') || localStorage.getItem('holdToken');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles) {
    const role = (user.role || '').toString().toLowerCase();
    const allowed = allowedRoles.map(r => r.toLowerCase());
    if (role && !allowed.includes(role)) {
      return <Navigate to="/login" />;
    }
  }

  return children;
};

export default ProtectedRoute;
