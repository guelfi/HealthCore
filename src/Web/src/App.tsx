import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './infrastructure/utils/theme';
import { useAuthStore } from './application/stores/authStore';
import { UserProfile } from './domain/enums/UserProfile';

// Components
import LoginForm from './presentation/components/auth/LoginForm';
import AppLayout from './presentation/components/layout/AppLayout';
import NetworkErrorBoundary from './presentation/components/common/NetworkErrorBoundary';

// Pages
import DashboardPage from './presentation/pages/DashboardPage';
import PacientesPageTable from './presentation/pages/PacientesPageTable';
import ExamesPageTable from './presentation/pages/ExamesPageTable';
import ExameAddPage from './presentation/pages/ExameAddPage';
import ExameEditPage from './presentation/pages/ExameEditPage';
import MedicosPageTable from './presentation/pages/MedicosPageTable';
import UsuariosPageTable from './presentation/pages/UsuariosPageTable';
import DiagnosticPage from './presentation/pages/DiagnosticPage';

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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NetworkErrorBoundary>
        <Router>
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
      </NetworkErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
