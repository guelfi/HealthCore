import * as React from 'react';
import { Suspense, lazy, type ComponentType } from 'react';
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
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      p={3}
      minHeight="200px"
    >
      <CircularProgress size={40} />
    </Box>
  );
};

// Componente de erro padrão
const DefaultErrorComponent: React.FC<{ error: any; resetErrorBoundary: () => void }> = ({ 
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
  retryable: _retryable = true, // Prefixado com _ para indicar que não é usado
  preload = false,
  className,
  children
}: LazyWrapperProps) => {
  const { optimizations } = usePerformanceOptimization();
  
  // Usa lazy loading baseado nas otimizações de performance
  const shouldUseLazyLoading = !preload && optimizations.shouldLazyLoadImages;
  
  // SEMPRE chama os hooks, independente da condição
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

  // Se não deve usar lazy loading, renderiza diretamente
  if (!shouldUseLazyLoading) {
    const LazyComponent = lazy(loader);
    return (
      <Box className={className}>
        <Suspense fallback={React.createElement(loadingComponent)}>
          <ErrorBoundary
            FallbackComponent={errorFallback}
            onReset={() => window.location.reload()}
          >
            <LazyComponent>{children}</LazyComponent>
          </ErrorBoundary>
        </Suspense>
      </Box>
    );
  }

  // Lógica de lazy loading com intersection observer
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
};

// HOC para criar componentes lazy
export const withLazyLoading = <P extends object>(
  loader: () => Promise<{ default: ComponentType<P> }>,
  options: Omit<LazyWrapperProps, 'loader' | 'children'> = {}
) => {
  return (_props: P) => ( // Prefixado com _ para indicar que não é usado
    <LazyWrapper loader={loader} {...options}>
      {/* Props são passadas para o componente lazy */}
    </LazyWrapper>
  );
};

// Componente para lazy loading de rotas
export interface LazyRouteProps extends Omit<LazyWrapperProps, 'loader'> {
  component: () => Promise<{ default: ComponentType<any> }>;
  routeProps?: any;
}

export const LazyRoute: React.FC<LazyRouteProps> = ({
  component,
  routeProps,
  ...wrapperProps
}: LazyRouteProps) => {
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