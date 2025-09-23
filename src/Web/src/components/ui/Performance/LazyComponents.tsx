import React, { Suspense, lazy } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useResponsive } from '../../../presentation/hooks/useResponsive';

// Loading component optimized for mobile
const MobileLoadingSpinner: React.FC = () => {
  const { isMobile } = useResponsive();
  
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: isMobile ? 200 : 300,
        padding: 2,
      }}
    >
      <CircularProgress 
        size={isMobile ? 32 : 40}
        thickness={4}
        sx={{
          color: 'primary.main',
        }}
      />
    </Box>
  );
};

// Lazy loading wrapper for mobile optimization
interface LazyComponentWrapperProps {
  component: React.ComponentType<any>;
  fallback?: React.ComponentType;
  children?: React.ReactNode;
}

const LazyComponentWrapper: React.FC<LazyComponentWrapperProps> = ({
  component: Component,
  fallback: Fallback = MobileLoadingSpinner,
  children,
  ...props
}) => {
  return (
    <Suspense fallback={<Fallback />}>
      <Component {...props}>
        {children}
      </Component>
    </Suspense>
  );
};

// Performance optimized exports
export const LazyPacientesPage = lazy(() => 
  import('../../../presentation/pages/PacientesPageTable')
);

export const LazyMedicosPage = lazy(() => 
  import('../../../presentation/pages/MedicosPageTable')
);

export const LazyExamesPage = lazy(() => 
  import('../../../presentation/pages/ExamesPageTable')
);

export const LazyUsuariosPage = lazy(() => 
  import('../../../presentation/pages/UsuariosPageTable')
);

export { LazyComponentWrapper, MobileLoadingSpinner };