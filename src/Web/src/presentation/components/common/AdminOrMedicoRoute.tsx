import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../../application/stores/authStore';
import { UserProfile } from '../../../domain/enums/UserProfile';

interface AdminOrMedicoRouteProps {
  children: React.ReactNode;
}

const AdminOrMedicoRoute: React.FC<AdminOrMedicoRouteProps> = ({ children }) => {
  const { user } = useAuthStore();

  if (!user || (user.role !== UserProfile.ADMINISTRADOR && user.role !== UserProfile.MEDICO)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AdminOrMedicoRoute;