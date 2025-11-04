import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { ROLE_NAME, UserDTO } from '@/dto/user.dto';
import { useSessionStore } from '@/store/sessionStore';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ROLE_NAME[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user } = useSessionStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user.role) {
    const userRole = user.role.name as ROLE_NAME;
    const hasPermission = allowedRoles.includes(userRole);

    // need implmenting sth here
    if (!hasPermission) {
      return <Navigate to="/*" replace />;
    }
  }

  return <>{children}</>;

};

export default ProtectedRoute;
