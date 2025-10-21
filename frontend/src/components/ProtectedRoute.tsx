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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user.role && !allowedRoles.includes(user.role.name as ROLE_NAME)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
