import React, { useState, useEffect } from 'react';
import {
  Box,
  Fab,
  useTheme,
  alpha,
  Zoom,
} from '@mui/material';
import {
  TouchApp,
} from '@mui/icons-material';
import { SvgIcon } from '@mui/material';
import { useResponsive } from '../../../presentation/hooks/useResponsive';

interface DashboardScrollIndicatorsProps {
  enabled?: boolean;
  showUpButton?: boolean;
  showDownButton?: boolean;
}

// Ícone de dedo apontando para cima 👆
const FingerUpIcon: React.FC = () => (
  <Box sx={{ fontSize: '1.5rem', lineHeight: 1 }}>👆</Box>
);

// Ícone de dedo apontando para baixo 👇
const FingerDownIcon: React.FC = () => (
  <Box sx={{ fontSize: '1.5rem', lineHeight: 1 }}>👇</Box>
);

const DashboardScrollIndicators: React.FC<DashboardScrollIndicatorsProps> = ({
  enabled = true,
  showUpButton = true,
  showDownButton = true,
}) => {
  const theme = useTheme();
  const { isMobile } = useResponsive();
  const [scrollState, setScrollState] = useState({
    canScrollUp: false,
    canScrollDown: false,
    showIndicators: false,
  });

  // Só renderiza em mobile e se habilitado
  if (!isMobile || !enabled) {
    return null;
  }

  useEffect(() => {
    const checkScrollState = () => {
      const scrollContainer = document.querySelector('[data-scroll-container]') ||
                             document.documentElement;
      
      if (!scrollContainer) return;

      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const canScrollUp = scrollTop > 20; // Threshold reduzido para melhor UX
      const canScrollDown = scrollTop < scrollHeight - clientHeight - 20;
      
      setScrollState({
        canScrollUp,
        canScrollDown,
        showIndicators: canScrollUp || canScrollDown,
      });
    };

    // Verificar estado inicial
    checkScrollState();

    // Adicionar listeners
    const scrollContainer = document.querySelector('[data-scroll-container]') ||
                           window;
    
    scrollContainer.addEventListener('scroll', checkScrollState);
    window.addEventListener('resize', checkScrollState);

    // Cleanup
    return () => {
      scrollContainer.removeEventListener('scroll', checkScrollState);
      window.removeEventListener('resize', checkScrollState);
    };
  }, []);

  const handleScrollUp = () => {
    const scrollContainer = document.querySelector('[data-scroll-container]');
    
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: Math.max(0, scrollContainer.scrollTop - 300),
        behavior: 'smooth'
      });
    } else {
      window.scrollTo({
        top: Math.max(0, window.pageYOffset - 300),
        behavior: 'smooth'
      });
    }
  };

  const handleScrollDown = () => {
    const scrollContainer = document.querySelector('[data-scroll-container]');
    
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: scrollContainer.scrollTop + 300,
        behavior: 'smooth'
      });
    } else {
      window.scrollTo({
        top: window.pageYOffset + 300,
        behavior: 'smooth'
      });
    }
  };

  const fabBaseStyles = {
    position: 'fixed' as const,
    right: 16,
    zIndex: 1100,
    width: 48,
    height: 48,
    minHeight: 48,
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.9)} 0%, ${alpha(theme.palette.primary.dark, 0.9)} 100%)`,
    backdropFilter: 'blur(10px)',
    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
    boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
    color: theme.palette.primary.contrastText,
    
    // Animações e interações
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    
    '&:hover': {
      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
      transform: 'scale(1.1)',
      boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
    },
    
    '&:active': {
      transform: 'scale(0.95)',
      transition: 'transform 0.1s ease',
    },
  };

  return (
    <Box>
      {/* Botão Scroll Up */}
      {showUpButton && scrollState.canScrollUp && (
        <Zoom in={scrollState.canScrollUp} timeout={300}>
          <Fab
            onClick={handleScrollUp}
            size="medium"
            sx={{
              ...fabBaseStyles,
              bottom: 120, // Posição do botão superior
            }}
            aria-label="Scroll para cima"
          >
            <FingerUpIcon />
          </Fab>
        </Zoom>
      )}

      {/* Botão Scroll Down */}
      {showDownButton && scrollState.canScrollDown && (
        <Zoom in={scrollState.canScrollDown} timeout={300}>
          <Fab
            onClick={handleScrollDown}
            size="medium"
            sx={{
              ...fabBaseStyles,
              bottom: 64, // Posição do botão inferior
            }}
            aria-label="Scroll para baixo"
          >
            <FingerDownIcon />
          </Fab>
        </Zoom>
      )}


    </Box>
  );
};

export default DashboardScrollIndicators;