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
import AdminOrMedicoRoute from './presentation/components/common/AdminOrMedicoRoute';

// Pages
import DashboardPage from './presentation/pages/DashboardPage';
import PacientesPageTable from './presentation/pages/PacientesPageTable';
import ExamesPageTable from './presentation/pages/ExamesPageTable';
import ExameAddPage from './presentation/pages/ExameAddPage';
import ExameEditPage from './presentation/pages/ExameEditPage';
import MedicosPageTable from './presentation/pages/MedicosPageTable';
import UsuariosPageTable from './presentation/pages/UsuariosPageTable';
import EspecialidadesPageTable from './presentation/pages/EspecialidadesPageTable';
import DiagnosticPage from './presentation/pages/DiagnosticPage';

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

            <Route path="/diagnostic" element={<DiagnosticPage />} />

            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Navigate to="/login" replace />
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
