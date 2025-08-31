import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../application/stores/authStore';
import { UserProfile } from '../../../domain/enums/UserProfile';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserProfile[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (
    requiredRoles &&
    user &&
    !requiredRoles.includes(user.role as UserProfile)
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
