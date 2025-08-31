import React from 'react';
import { Grid, Box } from '@mui/material';
import { useResponsive } from '../../hooks/useResponsive';

interface ResponsiveGridProps {
  children: React.ReactNode;
  xs?: number | 'auto';
  sm?: number | 'auto';
  md?: number | 'auto';
  lg?: number | 'auto';
  xl?: number | 'auto';
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  xs = 12,
  sm,
  md,
  lg,
  xl,
}) => {
  return (
    <Box
      sx={{
        width: '100%',
        '@media (max-width: 600px)': {
          width: xs === 'auto' ? 'auto' : `${(xs / 12) * 100}%`,
        },
        '@media (min-width: 600px)': {
          width: sm ? (sm === 'auto' ? 'auto' : `${(sm / 12) * 100}%`) : xs === 'auto' ? 'auto' : `${(xs / 12) * 100}%`,
        },
        '@media (min-width: 900px)': {
          width: md ? (md === 'auto' ? 'auto' : `${(md / 12) * 100}%`) : sm ? (sm === 'auto' ? 'auto' : `${(sm / 12) * 100}%`) : xs === 'auto' ? 'auto' : `${(xs / 12) * 100}%`,
        },
        '@media (min-width: 1200px)': {
          width: lg ? (lg === 'auto' ? 'auto' : `${(lg / 12) * 100}%`) : md ? (md === 'auto' ? 'auto' : `${(md / 12) * 100}%`) : sm ? (sm === 'auto' ? 'auto' : `${(sm / 12) * 100}%`) : xs === 'auto' ? 'auto' : `${(xs / 12) * 100}%`,
        },
        '@media (min-width: 1536px)': {
          width: xl ? (xl === 'auto' ? 'auto' : `${(xl / 12) * 100}%`) : lg ? (lg === 'auto' ? 'auto' : `${(lg / 12) * 100}%`) : md ? (md === 'auto' ? 'auto' : `${(md / 12) * 100}%`) : sm ? (sm === 'auto' ? 'auto' : `${(sm / 12) * 100}%`) : xs === 'auto' ? 'auto' : `${(xs / 12) * 100}%`,
        },
      }}
    >
      {children}
    </Box>
  );
};

// Componente container para grids responsivos
interface ResponsiveGridContainerProps {
  children: React.ReactNode;
  spacing?: number;
}

export const ResponsiveGridContainer: React.FC<
  ResponsiveGridContainerProps
> = ({ children, spacing = 2 }) => {
  const { isMobile } = useResponsive();

  return (
    <Grid container spacing={isMobile ? 1 : spacing}>
      {children}
    </Grid>
  );
};

export default ResponsiveGrid;
