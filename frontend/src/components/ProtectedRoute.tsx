import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { ROLE_NAME, UserDTO } from '@/dto/user.dto';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ROLE_NAME[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const userStr = localStorage.getItem('user');
  const user: UserDTO | null = userStr ? JSON.parse(userStr) : null;

  console.log('ProtectedRoute - User string from localStorage:', userStr);
  console.log('ProtectedRoute - Parsed user:', user);
  console.log('ProtectedRoute - Allowed roles:', allowedRoles);

  if (!user) {
    console.log('ProtectedRoute - No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user.role) {
    const userRole = user.role.name as ROLE_NAME;
    const hasPermission = allowedRoles.includes(userRole);

    console.log('ProtectedRoute - User role name:', user.role.name);
    console.log('ProtectedRoute - User role as enum:', userRole);
    console.log('ProtectedRoute - Has permission:', hasPermission);

    if (!hasPermission) {
      console.log('ProtectedRoute - No permission, redirecting to dashboard');
      return <Navigate to="/dashboard" replace />;
    }
  }

  console.log('ProtectedRoute - Access granted');
  return <>{children}</>;
};

export default ProtectedRoute;
