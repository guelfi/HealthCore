import React from 'react';
import { useAuthStore } from '../../application/stores/authStore';
import { UserProfile } from '../../domain/enums/UserProfile';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import MedicoDashboard from '../components/dashboard/MedicoDashboard';

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();

  // Garantir que o dashboard sempre inicie no topo
  React.useEffect(() => {
    // Scroll imediato para o topo
    window.scrollTo(0, 0);

    // Scroll suave após um pequeno delay para garantir que o componente foi renderizado
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Loading state while user is being determined
  if (!user) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Carregando Dashboard...</h2>
      </div>
    );
  }

  if (user.role === UserProfile.ADMINISTRADOR) {
    return <AdminDashboard />;
  }

  return <MedicoDashboard />;
};

export default DashboardPage;
