import React from 'react';
import {
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  useTheme,
  Backdrop,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useResponsive } from '../../../presentation/hooks/useResponsive';

export interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  onClick?: () => void;
}

export interface HamburgerMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  menuItems: MenuItem[];
  theme?: 'light' | 'dark';
  userInfo?: {
    name: string;
    role: string;
  };
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  isOpen,
  onToggle,
  onClose,
  menuItems,
  theme = 'light',
  userInfo,
}) => {
  const muiTheme = useTheme();
  const { isMobile } = useResponsive();

  // Só renderiza em mobile
  if (!isMobile) {
    return null;
  }

  const handleMenuItemClick = (item: MenuItem) => {
    if (item.onClick) {
      item.onClick();
    }
    onClose(); // Fecha o menu após navegação
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  return (
    <>
      {/* Botão Hambúrguer */}
      <IconButton
        edge="start"
        color="inherit"
        aria-label="menu"
        onClick={onToggle}
        sx={{
          display: { xs: 'block', md: 'none' },
          mr: 2,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
          transition: 'all 0.2s ease-in-out',
        }}
      >
        <MenuIcon />
      </IconButton>

      {/* Drawer Mobile */}
      <Drawer
        anchor="left"
        open={isOpen}
        onClose={onClose}
        onKeyDown={handleKeyDown}
        variant="temporary"
        ModalProps={{
          keepMounted: true, // Melhor performance em mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            backgroundColor: theme === 'dark' ? muiTheme.palette.grey[900] : muiTheme.palette.background.paper,
            borderRight: `1px solid ${muiTheme.palette.divider}`,
          },
        }}
        SlideProps={{
          timeout: 300, // Animação suave de 300ms
        }}
      >
        <Box
          sx={{
            width: 280,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
          role="presentation"
        >
          {/* Header do Drawer */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              borderBottom: `1px solid ${muiTheme.palette.divider}`,
            }}
          >
            <Typography variant="h6" component="div">
              HealthCore
            </Typography>
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                '&:hover': {
                  backgroundColor: muiTheme.palette.action.hover,
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Informações do Usuário */}
          {userInfo && (
            <>
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="medium">
                  {userInfo.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {userInfo.role}
                </Typography>
              </Box>
              <Divider />
            </>
          )}

          {/* Lista de Menu */}
          <List sx={{ flexGrow: 1, pt: 1 }}>
            {menuItems.map((item, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton
                  onClick={() => handleMenuItemClick(item)}
                  sx={{
                    minHeight: 48,
                    px: 2.5,
                    '&:hover': {
                      backgroundColor: muiTheme.palette.action.hover,
                    },
                    '&:active': {
                      backgroundColor: muiTheme.palette.action.selected,
                    },
                    // Feedback visual para touch
                    '&:focus-visible': {
                      backgroundColor: muiTheme.palette.action.focus,
                      outline: `2px solid ${muiTheme.palette.primary.main}`,
                      outlineOffset: -2,
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: muiTheme.palette.text.secondary,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontSize: '0.95rem',
                        fontWeight: 500,
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Backdrop personalizado para melhor UX */}
      <Backdrop
        open={isOpen}
        onClick={onClose}
        sx={{
          display: { xs: 'block', md: 'none' },
          zIndex: muiTheme.zIndex.drawer - 1,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(2px)',
        }}
      />
    </>
  );
};

export default HamburgerMenu;