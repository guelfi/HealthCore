import React from 'react';
import {
  Fab,
  useTheme,
  alpha,
  Tooltip,
  Zoom,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useResponsive } from '../../../presentation/hooks/useResponsive';

interface MobileAddFabProps {
  onClick: () => void;
  tooltip?: string;
  disabled?: boolean;
  loading?: boolean;
  color?: 'primary' | 'secondary' | 'default';
  size?: 'small' | 'medium' | 'large';
  position?: {
    bottom?: number;
    right?: number;
    left?: number;
    top?: number;
  };
  // Novo: posicionamento relativo ao container
  positionType?: 'fixed' | 'absolute';
  containerRelative?: boolean;
}

const MobileAddFab: React.FC<MobileAddFabProps> = ({
  onClick,
  tooltip = 'Adicionar',
  disabled = false,
  loading = false,
  color = 'primary',
  size = 'large',
  position = { bottom: 24, right: 24 },
  positionType = 'fixed',
  containerRelative = false,
}) => {
  const theme = useTheme();
  const { isMobile, isTablet, isTouchDevice } = useResponsive();

  // Só renderiza em mobile/tablet
  if (!isMobile && !isTablet) {
    return null;
  }

  const fabStyles = {
    position: (containerRelative ? 'absolute' : positionType) as const,
    zIndex: containerRelative ? 100 : 1000,
    bottom: position.bottom,
    right: position.right,
    left: position.left,
    top: position.top,
    
    // Tamanho otimizado para touch
    ...(size === 'large' && {
      width: 64,
      height: 64,
    }),
    
    // Cores e visual
    background: color === 'primary' 
      ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
      : theme.palette.secondary.main,
    
    color: theme.palette.primary.contrastText,
    boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
    
    // Interações touch otimizadas
    '&:hover': {
      background: color === 'primary'
        ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${alpha(theme.palette.primary.dark, 0.8)} 100%)`
        : theme.palette.secondary.dark,
      boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
      transform: 'scale(1.05)',
    },
    
    // Feedback visual para touch
    ...(isTouchDevice && {
      '&:active': {
        transform: 'scale(0.95)',
        transition: 'transform 0.1s ease',
      },
    }),
    
    // Animações suaves
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    
    // Estados
    ...(disabled && {
      background: theme.palette.action.disabledBackground,
      color: theme.palette.action.disabled,
      boxShadow: 'none',
    }),
    
    ...(loading && {
      background: alpha(theme.palette.primary.main, 0.6),
    }),
  };

  const fabComponent = (
    <Zoom in={true} timeout={300}>
      <Fab
        onClick={onClick}
        disabled={disabled || loading}
        size={size}
        sx={fabStyles}
        aria-label={tooltip}
      >
        <AddIcon 
          sx={{ 
            fontSize: size === 'large' ? '2rem' : '1.5rem',
            // Animação de rotação quando loading
            ...(loading && {
              animation: 'spin 1s linear infinite',
              '@keyframes spin': {
                '0%': {
                  transform: 'rotate(0deg)',
                },
                '100%': {
                  transform: 'rotate(360deg)',
                },
              },
            }),
          }} 
        />
      </Fab>
    </Zoom>
  );

  // Com tooltip em dispositivos que suportam hover
  if (!isTouchDevice) {
    return (
      <Tooltip title={tooltip} placement="left">
        {fabComponent}
      </Tooltip>
    );
  }

  return fabComponent;
};

export default MobileAddFab;