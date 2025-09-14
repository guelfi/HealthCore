import React, { Suspense, lazy, ComponentType } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { ErrorBoundary } from 'react-error-boundary';
import { usePerformanceOptimization } from '../../../hooks/usePerformanceOptimization';
import { useLazyComponent } from '../../../hooks/useLazyLoad';
import { BaseSkeleton } from '../Skeleton';

export interface LazyWrapperProps {
  loader: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ComponentType;
  errorFallback?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>;
  loadingComponent?: React.ComponentType;
  retryable?: boolean;
  preload?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// Componente de loading padrão
const DefaultLoadingComponent: React.FC = () => {
  const { optimizations } = usePerformanceOptimization();
  
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight={200}
      p={3}
    >
      <CircularProgress 
        size={40}
        sx={{
          animation: optimizations.shouldReduceAnimations ? 'none' : undefined
        }}
      />
    </Box>
  );
};

// Componente de erro padrão
const DefaultErrorComponent: React.FC<{ error: Error; resetErrorBoundary: () => void }> = ({ 
  error, 
  resetErrorBoundary 
}) => (
  <Alert 
    severity="error" 
    action={
      <button onClick={resetErrorBoundary} style={{ marginLeft: 8 }}>
        Tentar novamente
      </button>
    }
    sx={{ m: 2 }}
  >
    Erro ao carregar componente: {error.message}
  </Alert>
);

// Skeleton para componentes
const ComponentSkeleton: React.FC = () => (
  <Box p={2}>
    <BaseSkeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
    <BaseSkeleton variant="rectangular" width="100%" height={200} sx={{ mb: 2 }} />
    <Box display="flex" gap={1}>
      <BaseSkeleton variant="rectangular" width={100} height={36} />
      <BaseSkeleton variant="rectangular" width={100} height={36} />
    </Box>
  </Box>
);

export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  loader,
  fallback,
  errorFallback = DefaultErrorComponent,
  loadingComponent = DefaultLoadingComponent,
  retryable = true,
  preload = false,
  className,
  children
}) => {
  const { optimizations } = usePerformanceOptimization();
  
  // Usa lazy loading baseado nas otimizações de performance
  const shouldUseLazyLoading = !preload && optimizations.shouldLazyLoadImages;
  
  if (shouldUseLazyLoading) {
    const {
      ref,
      Component,
      isLoading,
      error,
      isVisible
    } = useLazyComponent({
      loader,
      fallback,
      threshold: 0.1,
      rootMargin: '100px'
    });

    if (!isVisible) {
      return (
        <Box ref={ref} className={className}>
          <ComponentSkeleton />
        </Box>
      );
    }

    if (isLoading) {
      return (
        <Box className={className}>
          {React.createElement(loadingComponent)}
        </Box>
      );
    }

    if (error) {
      return (
        <Box className={className}>
          {React.createElement(errorFallback, { 
            error, 
            resetErrorBoundary: () => window.location.reload() 
          })}
        </Box>
      );
    }

    if (Component) {
      return (
        <Box className={className}>
          <ErrorBoundary
            FallbackComponent={errorFallback}
            onReset={() => window.location.reload()}
          >
            <Component>{children}</Component>
          </ErrorBoundary>
        </Box>
      );
    }

    return null;
  }

  // Fallback para React.lazy tradicional
  const LazyComponent = lazy(loader);

  return (
    <ErrorBoundary
      FallbackComponent={errorFallback}
      onReset={() => window.location.reload()}
    >
      <Suspense fallback={React.createElement(loadingComponent)}>
        <Box className={className}>
          <LazyComponent>{children}</LazyComponent>
        </Box>
      </Suspense>
    </ErrorBoundary>
  );
};

// HOC para criar componentes lazy
export const withLazyLoading = <P extends object>(
  loader: () => Promise<{ default: ComponentType<P> }>,
  options: Omit<LazyWrapperProps, 'loader' | 'children'> = {}
) => {
  return (props: P) => (
    <LazyWrapper loader={loader} {...options}>
      {/* Props são passadas para o componente lazy */}
    </LazyWrapper>
  );
};

// Componente para lazy loading de rotas
export interface LazyRouteProps extends LazyWrapperProps {
  component: () => Promise<{ default: ComponentType<any> }>;
  routeProps?: any;
}

export const LazyRoute: React.FC<LazyRouteProps> = ({
  component,
  routeProps,
  ...wrapperProps
}) => {
  return (
    <LazyWrapper
      loader={component}
      loadingComponent={() => (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <CircularProgress />
        </Box>
      )}
      {...wrapperProps}
    >
      {/* Route props podem ser passadas aqui */}
    </LazyWrapper>
  );
};

// Utilitário para preload de componentes
export const preloadComponent = (loader: () => Promise<{ default: ComponentType<any> }>) => {
  // Preload apenas se a conexão for boa
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    if (['slow-2g', '2g', '3g'].includes(connection?.effectiveType)) {
      return; // Não preload em conexões lentas
    }
  }

  // Preload com requestIdleCallback se disponível
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => {
      loader().catch(() => {
        // Ignora erros de preload
      });
    });
  } else {
    // Fallback com setTimeout
    setTimeout(() => {
      loader().catch(() => {
        // Ignora erros de preload
      });
    }, 100);
  }
};

// Hook para preload condicional
export const usePreloadComponent = (
  loader: () => Promise<{ default: ComponentType<any> }>,
  condition: boolean = true
) => {
  const { optimizations } = usePerformanceOptimization();
  
  React.useEffect(() => {
    if (condition && optimizations.shouldPreloadCritical) {
      preloadComponent(loader);
    }
  }, [loader, condition, optimizations.shouldPreloadCritical]);
};

export default LazyWrapper;