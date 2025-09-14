import React from 'react';
import { Skeleton, Box, SkeletonProps } from '@mui/material';
import { useResponsive } from '../../../hooks/useResponsive';

export interface BaseSkeletonProps extends Omit<SkeletonProps, 'variant'> {
  variant?: 'text' | 'rectangular' | 'circular' | 'rounded';
  lines?: number;
  spacing?: number;
  responsive?: boolean;
  mobileHeight?: number | string;
  tabletHeight?: number | string;
  desktopHeight?: number | string;
  className?: string;
}

export const BaseSkeleton: React.FC<BaseSkeletonProps> = ({
  variant = 'text',
  lines = 1,
  spacing = 8,
  responsive = false,
  mobileHeight,
  tabletHeight,
  desktopHeight,
  className,
  height,
  width,
  ...props
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // Determina a altura baseada na responsividade
  const getResponsiveHeight = () => {
    if (!responsive) return height;
    
    if (isMobile && mobileHeight) return mobileHeight;
    if (isTablet && tabletHeight) return tabletHeight;
    if (isDesktop && desktopHeight) return desktopHeight;
    
    return height;
  };

  // Para múltiplas linhas de texto
  if (variant === 'text' && lines > 1) {
    return (
      <Box className={`base-skeleton-multiline ${className || ''}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            variant="text"
            width={index === lines - 1 ? '75%' : '100%'} // Última linha mais curta
            height={getResponsiveHeight()}
            sx={{
              marginBottom: index < lines - 1 ? `${spacing}px` : 0,
              fontSize: isMobile ? '0.875rem' : '1rem',
            }}
            {...props}
          />
        ))}
      </Box>
    );
  }

  return (
    <Skeleton
      variant={variant}
      width={width}
      height={getResponsiveHeight()}
      className={`base-skeleton ${className || ''}`}
      sx={{
        borderRadius: variant === 'rounded' ? 2 : undefined,
        fontSize: variant === 'text' && isMobile ? '0.875rem' : undefined,
      }}
      {...props}
    />
  );
};

export default BaseSkeleton;