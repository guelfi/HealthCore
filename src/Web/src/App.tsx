import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { healthCoreTheme } from './styles/healthcore-theme';
import { useAuthStore } from './application/stores/authStore';
import { UserProfile } from './domain/enums/UserProfile';

// Components
import LoginForm from './presentation/components/auth/LoginForm';
import AppLayout from './presentation/components/layout/AppLayout';
import NetworkErrorBoundary from './presentation/components/common/NetworkErrorBoundary';

// Pages
import { DashboardPage } from './presentation/features/dashboard';
import { PacientesPageTable } from './presentation/features/patients';
import { ExamesPageTable, ExameAddPage, ExameEditPage } from './presentation/features/exams';
import { MedicosPageTable } from './presentation/features/medical';
import { UsuariosPageTable } from './presentation/features/users';
import { EspecialidadesPageTable } from './presentation/features/specialties';
import ProfilePage from './presentation/features/profile/ProfilePage';
import LandingPage from './presentation/features/landing/LandingPage';
import BillingSettingsPage from './presentation/features/billing/BillingSettingsPage';

// Debug components (only in development)
import MobileDebugger from './components/dev/MobileDebugger';
import NotificationSystem from './presentation/components/common/NotificationSystem';

// Componente para proteger rotas administrativas
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();

  if (user?.role !== UserProfile.ADMINISTRADOR) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <ThemeProvider theme={healthCoreTheme}>
      <CssBaseline />
      <NetworkErrorBoundary>
        <Router basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <LoginForm />
                )
              }
            />

            <Route
              path="/dashboard"
              element={
                isAuthenticated ? (
                  <AppLayout>
                    <DashboardPage />
                  </AppLayout>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/pacientes"
              element={
                isAuthenticated ? (
                  <AppLayout>
                    <PacientesPageTable />
                  </AppLayout>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/exames"
              element={
                isAuthenticated ? (
                  <AppLayout>
                    <ExamesPageTable />
                  </AppLayout>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/exames/novo"
              element={
                isAuthenticated ? (
                  <AppLayout>
                    <ExameAddPage />
                  </AppLayout>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/exames/editar/:id"
              element={
                isAuthenticated ? (
                  <AppLayout>
                    <ExameEditPage />
                  </AppLayout>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/especialidades"
              element={
                isAuthenticated ? (
                  <AppLayout>
                    <EspecialidadesPageTable />
                  </AppLayout>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />


            <Route
              path="/perfil"
              element={
                isAuthenticated ? (
                  <AppLayout>
                    <ProfilePage />
                  </AppLayout>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/admin/medicos"
              element={
                isAuthenticated ? (
                  <AdminRoute>
                    <AppLayout>
                      <MedicosPageTable />
                    </AppLayout>
                  </AdminRoute>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />


            <Route
              path="/admin/cobranca"
              element={
                isAuthenticated ? (
                  <AdminRoute>
                    <AppLayout>
                      <BillingSettingsPage />
                    </AppLayout>
                  </AdminRoute>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/admin/usuarios"
              element={
                isAuthenticated ? (
                  <AdminRoute>
                    <AppLayout>
                      <UsuariosPageTable />
                    </AppLayout>
                  </AdminRoute>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />


            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <LandingPage />
                )
              }
            />
          </Routes>
        </Router>
        
        {/* Mobile Debugger - apenas em desenvolvimento */}
        <MobileDebugger />
      </NetworkErrorBoundary>
      {/* Toast notifications globais */}
      <NotificationSystem />
    </ThemeProvider>
  );
};

export default App;
