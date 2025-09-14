import React, { useState, useCallback } from 'react';
import { Box, IconButton, Skeleton } from '@mui/material';
import { Refresh as RefreshIcon, BrokenImage as BrokenImageIcon } from '@mui/icons-material';
import { useLazyImage } from '../../../hooks/useLazyLoad';
import { usePerformanceOptimization } from '../../../hooks/usePerformanceOptimization';
import { useResponsive } from '../../../hooks/useResponsive';

export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  placeholder?: string;
  fallback?: string;
  webpSrc?: string;
  mobileSrc?: string;
  className?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  priority?: boolean;
  quality?: number;
  lazy?: boolean;
  showRetry?: boolean;
  onLoad?: () => void;
  onError?: (error: Event) => void;
  onClick?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width = '100%',
  height = 'auto',
  placeholder,
  fallback,
  webpSrc,
  mobileSrc,
  className,
  objectFit = 'cover',
  priority = false,
  quality,
  lazy = true,
  showRetry = true,
  onLoad,
  onError,
  onClick
}) => {
  const { isMobile } = useResponsive();
  const { optimizations } = usePerformanceOptimization();
  const [retryCount, setRetryCount] = useState(0);

  // Determina qualidade baseada na performance
  const imageQuality = quality || optimizations.imageQuality;
  
  // Desabilita lazy loading se for prioridade ou se otimizações indicarem
  const shouldLazyLoad = lazy && !priority && optimizations.shouldLazyLoadImages;

  const {
    ref,
    src: currentSrc,
    isVisible,
    isLoaded,
    isError,
    retry
  } = useLazyImage({
    src,
    placeholder,
    fallback,
    webpSrc,
    mobileSrc,
    quality: imageQuality,
    disabled: !shouldLazyLoad,
    threshold: isMobile ? 0.1 : 0.2,
    rootMargin: isMobile ? '100px' : '50px'
  });

  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    retry();
  }, [retry]);

  const handleLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    onError?.(event.nativeEvent);
  }, [onError]);

  // Renderiza skeleton enquanto carrega
  if (shouldLazyLoad && (!isVisible || !currentSrc)) {
    return (
      <Box
        ref={ref}
        className={`optimized-image-skeleton ${className || ''}`}
        sx={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'grey.100',
          borderRadius: 1,
        }}
      >
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          animation={optimizations.shouldReduceAnimations ? false : 'wave'}
        />
      </Box>
    );
  }

  // Renderiza estado de erro
  if (isError) {
    return (
      <Box
        className={`optimized-image-error ${className || ''}`}
        sx={{
          width,
          height,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'grey.100',
          borderRadius: 1,
          border: '1px dashed',
          borderColor: 'grey.300',
          color: 'grey.500',
          p: 2,
        }}
      >
        <BrokenImageIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
        <Box sx={{ textAlign: 'center', mb: showRetry ? 1 : 0 }}>
          <Box sx={{ fontSize: '0.875rem', fontWeight: 500 }}>Erro ao carregar imagem</Box>
          {retryCount > 0 && (
            <Box sx={{ fontSize: '0.75rem', opacity: 0.7 }}>
              Tentativas: {retryCount}
            </Box>
          )}
        </Box>
        {showRetry && (
          <IconButton
            size="small"
            onClick={handleRetry}
            sx={{
              backgroundColor: 'background.paper',
              '&:hover': {
                backgroundColor: 'grey.50',
              },
            }}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    );
  }

  return (
    <Box
      ref={shouldLazyLoad ? ref : undefined}
      className={`optimized-image-container ${className || ''}`}
      sx={{
        width,
        height,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 1,
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
    >
      <img
        src={currentSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          width: '100%',
          height: '100%',
          objectFit,
          transition: optimizations.shouldReduceAnimations 
            ? 'none' 
            : 'opacity 0.3s ease-in-out',
          opacity: isLoaded ? 1 : 0,
        }}
      />
      
      {/* Overlay de loading */}
      {!isLoaded && currentSrc && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
          }}
        >
          <Skeleton
            variant="rectangular"
            width="100%"
            height="100%"
            animation={optimizations.shouldReduceAnimations ? false : 'pulse'}
          />
        </Box>
      )}
    </Box>
  );
};

// Componente de avatar otimizado
export interface OptimizedAvatarProps extends Omit<OptimizedImageProps, 'objectFit'> {
  size?: number;
  variant?: 'circular' | 'rounded' | 'square';
}

export const OptimizedAvatar: React.FC<OptimizedAvatarProps> = ({
  size = 40,
  variant = 'circular',
  ...props
}) => {
  const borderRadius = {
    circular: '50%',
    rounded: '8px',
    square: '0px'
  }[variant];

  return (
    <OptimizedImage
      {...props}
      width={size}
      height={size}
      objectFit="cover"
      className={`optimized-avatar ${props.className || ''}`}
      style={{
        borderRadius,
        ...props.style
      }}
    />
  );
};

export default OptimizedImage;