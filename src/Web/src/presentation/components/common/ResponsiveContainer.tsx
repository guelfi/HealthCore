import React from 'react';
import { Box, Container, useTheme } from '@mui/material';
import { useResponsive } from '../../hooks/useResponsive';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  disableGutters?: boolean;
  fullHeight?: boolean;
  padding?: number | string;
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  maxWidth = 'lg',
  disableGutters = false,
  fullHeight = false,
  padding,
}) => {
  const theme = useTheme();
  const { isMobile, isTablet } = useResponsive();

  // Determinar padding baseado no dispositivo
  const getPadding = () => {
    if (padding !== undefined) return padding;

    if (isMobile) return theme.spacing(1);
    if (isTablet) return theme.spacing(2);
    return theme.spacing(3);
  };

  return (
    <Container
      maxWidth={maxWidth}
      disableGutters={disableGutters}
      sx={{
        height: fullHeight ? '100%' : 'auto',
        minHeight: fullHeight ? '100vh' : 'auto',
        padding: getPadding(),
        display: 'flex',
        flexDirection: 'column',
        // Ajustes específicos para mobile
        ...(isMobile && {
          padding: theme.spacing(1),
          '& .MuiCard-root': {
            margin: theme.spacing(0.5),
            borderRadius: theme.spacing(1),
          },
        }),
        // Ajustes específicos para tablet
        ...(isTablet && {
          padding: theme.spacing(2),
        }),
      }}
    >
      {children}
    </Container>
  );
};

export default ResponsiveContainer;
