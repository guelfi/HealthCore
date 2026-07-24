import React, { useState, useEffect } from 'react';
import { Box, Fab, useTheme, alpha, Zoom } from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';

import { useResponsive } from '../../../presentation/hooks/useResponsive';

interface DashboardScrollIndicatorsProps {
  enabled?: boolean;
  showUpButton?: boolean;
  showDownButton?: boolean;
  mobileOnly?: boolean;
}

const DashboardScrollIndicators: React.FC<DashboardScrollIndicatorsProps> = ({
  enabled = true,
  showUpButton = true,
  showDownButton = true,
  mobileOnly = true,
}) => {
  const theme = useTheme();
  const { isMobile } = useResponsive();
  const [scrollState, setScrollState] = useState({
    canScrollUp: false,
    canScrollDown: false,
  });

  useEffect(() => {
    if ((mobileOnly && !isMobile) || !enabled) {
      return;
    }

    const getScrollContainer = () =>
      document.querySelector('[data-scroll-container]') || document.documentElement;

    const checkScrollState = () => {
      const scrollContainer = getScrollContainer();
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;

      setScrollState({
        canScrollUp: scrollTop > 20,
        canScrollDown: scrollTop < scrollHeight - clientHeight - 20,
      });
    };

    checkScrollState();

    const scrollContainer = document.querySelector('[data-scroll-container]') || window;
    scrollContainer.addEventListener('scroll', checkScrollState);
    window.addEventListener('resize', checkScrollState);

    return () => {
      scrollContainer.removeEventListener('scroll', checkScrollState);
      window.removeEventListener('resize', checkScrollState);
    };
  }, [enabled, isMobile, mobileOnly]);

  if ((mobileOnly && !isMobile) || !enabled) {
    return null;
  }

  const scrollBy = (distance: number) => {
    const scrollContainer = document.querySelector('[data-scroll-container]');

    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: Math.max(0, scrollContainer.scrollTop + distance),
        behavior: 'smooth',
      });
      return;
    }

    window.scrollTo({
      top: Math.max(0, window.pageYOffset + distance),
      behavior: 'smooth',
    });
  };

  const fabBaseStyles = {
    position: 'fixed' as const,
    right: 16,
    zIndex: 1100,
    width: 48,
    height: 48,
    minHeight: 48,
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.92)} 0%, ${alpha(theme.palette.primary.dark, 0.92)} 100%)`,
    backdropFilter: 'blur(10px)',
    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
    boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
    color: theme.palette.primary.contrastText,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
      transform: 'scale(1.08)',
      boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
    },
    '&:active': {
      transform: 'scale(0.95)',
      transition: 'transform 0.1s ease',
    },
  };

  return (
    <Box>
      {showUpButton && scrollState.canScrollUp && (
        <Zoom in={scrollState.canScrollUp} timeout={300}>
          <Fab
            onClick={() => scrollBy(-300)}
            size="medium"
            sx={{ ...fabBaseStyles, bottom: 120 }}
            aria-label="Rolar para cima"
          >
            <KeyboardArrowUp />
          </Fab>
        </Zoom>
      )}

      {showDownButton && scrollState.canScrollDown && (
        <Zoom in={scrollState.canScrollDown} timeout={300}>
          <Fab
            onClick={() => scrollBy(300)}
            size="medium"
            sx={{ ...fabBaseStyles, bottom: 64 }}
            aria-label="Rolar para baixo"
          >
            <KeyboardArrowDown />
          </Fab>
        </Zoom>
      )}
    </Box>
  );
};

export default DashboardScrollIndicators;