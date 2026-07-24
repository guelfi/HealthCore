import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  Avatar,
  Button,
} from '@mui/material';
import {
  Dashboard,
  People,
  Assignment,
  AdminPanelSettings,
  LocalHospital,
  Logout,
  MedicalServices,
  AccountCircle,
  ReceiptLong,
} from '@mui/icons-material';
import { useAuthStore } from '../../../application/stores/authStore';
import { useUIStore } from '../../../application/stores/uiStore';
import { UserProfile } from '../../../domain/enums/UserProfile';
import { HamburgerMenu } from '../../../components/ui/Navigation';
import type { MenuItem as HamburgerMenuItem } from '../../../components/ui/Navigation';
import Footer from './Footer';

const drawerWidth = 240;

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const userMenuOpen = Boolean(anchorEl);

  React.useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(true);
    } else {
      // Em mobile, o sidebar deve começar fechado
      setSidebarOpen(false);
    }
  }, [isMobile, setSidebarOpen]);

  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleUserMenuClose();
    navigate('/perfil');
  };

  const handleLogout = async () => {
    handleUserMenuClose();
    await logout();
    navigate('/');
  };

  // Menu items para desktop sidebar
  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  ];

  if (user?.role === UserProfile.ADMINISTRADOR) {
    menuItems.push(
      { text: 'Médicos', icon: <LocalHospital />, path: '/admin/medicos' },
      { text: 'Especialidades', icon: <MedicalServices />, path: '/especialidades' },
      { text: 'Pacientes', icon: <People />, path: '/pacientes' },
      { text: 'Exames', icon: <Assignment />, path: '/exames' },
      { text: 'Cobrança', icon: <ReceiptLong />, path: '/admin/cobranca' },
      {
        text: 'Usuários',
        icon: <AdminPanelSettings />,
        path: '/admin/usuarios',
      }
    );
  } else {
    menuItems.push(
      { text: 'Especialidades', icon: <MedicalServices />, path: '/especialidades' },
      { text: 'Pacientes', icon: <People />, path: '/pacientes' },
      { text: 'Exames', icon: <Assignment />, path: '/exames' }
    );
  }

  // Menu items para HamburgerMenu (formato específico)
  const hamburgerMenuItems: HamburgerMenuItem[] = menuItems.map(item => ({
    ...item,
    onClick: () => handleMenuClick(item.path),
  }));

  const handleMenuClick = (path: string) => {
    navigate(path);
    if (isMobile) {
      toggleSidebar();
    }

    // Scroll to top when navigating, with special handling for Dashboard
    if (path === '/dashboard') {
      // Immediate scroll for Dashboard
      window.scrollTo(0, 0);
      // Additional smooth scroll after navigation
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Verificar se estamos no Dashboard ou em uma Page
  const isDashboard = location.pathname === '/dashboard';
  const userDisplayName = user?.displayName || user?.username || 'Usuário';
  const userInitial = userDisplayName.charAt(0).toUpperCase();
  const userRoleLabel = user?.role === UserProfile.ADMINISTRADOR ? 'Administrador' : 'Médico';

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar />
      <Box sx={{ overflow: 'auto', flex: 1 }}>
        <List>
          {menuItems.map(item => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={
                  location.pathname === item.path ||
                  location.pathname.startsWith(item.path + '/')
                }
                onClick={() => handleMenuClick(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
      {/* Footer no sidebar: sempre visível */}
      <Box sx={{ mt: 'auto' }}>
        <Footer compact />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: theme => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <HamburgerMenu
            isOpen={sidebarOpen}
            onToggle={toggleSidebar}
            onClose={() => setSidebarOpen(false)}
            menuItems={hamburgerMenuItems}
            theme={theme.palette.mode}
            userInfo={{
              name: userDisplayName,
              role: userRoleLabel,
            }}
          />
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            HealthCore
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              onClick={handleUserMenuClick}
              color="inherit"
              startIcon={
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: 'rgba(255, 255, 255, 0.22)',
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                >
                  {userInitial}
                </Avatar>
              }
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                maxWidth: { xs: 210, sm: 320 },
                '& .MuiButton-startIcon': { mr: 1 },
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  display: { xs: 'none', sm: 'block' },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {userDisplayName}
              </Typography>
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={userMenuOpen}
              onClose={handleUserMenuClose}
            >
              <MenuItem onClick={handleProfile} sx={{ alignItems: 'flex-start', py: 1.25 }}>
                <ListItemIcon>
                  <AccountCircle fontSize="small" />
                </ListItemIcon>
                <Box>
                  <Typography variant="body2" fontWeight={700} color="primary.main">
                    {userDisplayName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Meu perfil
                  </Typography>
                </Box>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                Sair
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flex: 1 }}>
        {/* Drawer Desktop - só renderiza em desktop */}
        {!isMobile && (
          <Drawer
            variant="permanent"
            open={sidebarOpen}
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              [`& .MuiDrawer-paper`]: {
                width: drawerWidth,
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
              },
            }}
          >
            {drawerContent}
          </Drawer>
        )}

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            position: 'fixed',
            top: { xs: '56px', sm: '64px' }, // Posição fixa após o header
            right: 0,
            bottom: 0,
            left: { xs: 0, sm: `${drawerWidth}px` }, // Considera o drawer em desktop
            overflow: 'hidden', // Remove scroll do container principal
          }}
        >
          {/* Container wrapper que inicia logo abaixo do header */}
          <Box
            data-scroll-container
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              overflowY: 'auto',
              overflowX: 'hidden',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'rgba(0,0,0,0.1)',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,0.3)',
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.5)',
                },
              },
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(0,0,0,0.3) rgba(0,0,0,0.1)',
            }}
          >
            {/* Container de conteúdo das páginas */}
            <Box
              sx={{
                p: { xs: 2, md: 2.5 },
                pb: isDashboard && !isMobile ? 3 : 3,
                minHeight: 'calc(100vh - 64px)', // Altura mínima considerando header
                // Dashboards: permitir scroll completo dos cards
                ...(isDashboard && {
                  minHeight: 'auto',
                  pb: 4, // Mais espaço no final para scroll completo
                }),
              }}
            >
              {children}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Footer removido da Dashboard - agora aparece apenas no sidebar */}
    </Box>
  );
};

export default AppLayout;
