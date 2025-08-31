import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  useTheme,
  useMediaQuery,
  Collapse,
} from '@mui/material';
import {
  Dashboard,
  People,
  Assignment,
  AdminPanelSettings,
  ExpandLess,
  ExpandMore,
  PersonAdd,
  Group,
  BarChart,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../application/stores/authStore';
import { useUIStore } from '../../../application/stores/uiStore';
import { UserProfile } from '../../../domain/enums/UserProfile';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: MenuItem[];
  roles?: UserProfile[];
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <Dashboard />,
    path: '/dashboard',
  },
  {
    id: 'pacientes',
    label: 'Pacientes',
    icon: <People />,
    children: [
      {
        id: 'pacientes-list',
        label: 'Listar Pacientes',
        icon: <Group />,
        path: '/pacientes',
      },
      {
        id: 'pacientes-create',
        label: 'Novo Paciente',
        icon: <PersonAdd />,
        path: '/pacientes/novo',
      },
    ],
  },
  {
    id: 'exames',
    label: 'Exames',
    icon: <Assignment />,
    children: [
      {
        id: 'exames-list',
        label: 'Listar Exames',
        icon: <Assignment />,
        path: '/exames',
      },
      {
        id: 'exames-create',
        label: 'Novo Exame',
        icon: <Assignment />,
        path: '/exames/novo',
      },
    ],
  },
  {
    id: 'admin',
    label: 'Administração',
    icon: <AdminPanelSettings />,
    roles: [UserProfile.ADMINISTRADOR],
    children: [
      {
        id: 'admin-usuarios',
        label: 'Usuários',
        icon: <Group />,
        path: '/admin/usuarios',
      },
      {
        id: 'admin-metrics',
        label: 'Métricas',
        icon: <BarChart />,
        path: '/admin/metricas',
      },
    ],
  },
];

const Sidebar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  const [expandedItems, setExpandedItems] = React.useState<string[]>([
    'pacientes',
    'exames',
  ]);

  const handleItemClick = (item: MenuItem) => {
    if (item.path) {
      navigate(item.path);
      if (isMobile) {
        setSidebarOpen(false);
      }
    } else if (item.children) {
      setExpandedItems(prev =>
        prev.includes(item.id)
          ? prev.filter(id => id !== item.id)
          : [...prev, item.id]
      );
    }
  };

  const isItemVisible = (item: MenuItem): boolean => {
    if (!item.roles) return true;
    return user ? item.roles.includes(user.role as UserProfile) : false;
  };

  const isItemActive = (path?: string): boolean => {
    if (!path) return false;
    return (
      location.pathname === path || location.pathname.startsWith(path + '/')
    );
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    if (!isItemVisible(item)) return null;

    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const isActive = isItemActive(item.path);

    return (
      <React.Fragment key={item.id}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleItemClick(item)}
            selected={isActive}
            sx={{
              pl: 2 + level * 2,
              minHeight: 48,
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
                '& .MuiListItemIcon-root': {
                  color: 'primary.contrastText',
                },
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: sidebarOpen ? 40 : 'auto',
                justifyContent: 'center',
              }}
            >
              {item.icon}
            </ListItemIcon>

            {sidebarOpen && (
              <>
                <ListItemText primary={item.label} />
                {hasChildren && (isExpanded ? <ExpandLess /> : <ExpandMore />)}
              </>
            )}
          </ListItemButton>
        </ListItem>

        {hasChildren && sidebarOpen && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map(child => renderMenuItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const drawerWidth = sidebarOpen ? 240 : 60;

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={isMobile ? sidebarOpen : true}
      onClose={() => setSidebarOpen(false)}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          mt: 8,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
        },
      }}
    >
      <Box sx={{ overflow: 'auto' }}>
        <List>{menuItems.map(item => renderMenuItem(item))}</List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
