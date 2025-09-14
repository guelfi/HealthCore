import React from 'react';
import { Box, BoxProps } from '@mui/material';
import { useResponsive } from '../../../presentation/hooks/useResponsive';

export interface ButtonGroupProps extends Omit<BoxProps, 'direction'> {
  /** Direção do grupo de botões */
  direction?: 'row' | 'column' | 'responsive';
  /** Espaçamento entre botões */
  spacing?: number;
  /** Alinhamento dos botões */
  align?: 'start' | 'center' | 'end' | 'stretch';
  /** Justificação dos botões */
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
  /** Se deve ocupar toda a largura */
  fullWidth?: boolean;
  /** Classe CSS adicional */
  className?: string;
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  direction = 'responsive',
  spacing = 2,
  align = 'center',
  justify = 'start',
  fullWidth = false,
  className,
  ...props
}) => {
  const { isMobile } = useResponsive();

  // Determina a direção baseada na prop e responsividade
  const getFlexDirection = () => {
    if (direction === 'responsive') {
      return isMobile ? 'column' : 'row';
    }
    return direction;
  };

  // Mapeia align para alignItems
  const getAlignItems = () => {
    const alignMap = {
      start: 'flex-start',
      center: 'center',
      end: 'flex-end',
      stretch: 'stretch',
    };
    return alignMap[align];
  };

  // Mapeia justify para justifyContent
  const getJustifyContent = () => {
    const justifyMap = {
      start: 'flex-start',
      center: 'center',
      end: 'flex-end',
      'space-between': 'space-between',
      'space-around': 'space-around',
    };
    return justifyMap[justify];
  };

  const flexDirection = getFlexDirection();

  return (
    <Box
      {...props}
      className={`button-group ${className || ''}`}
      sx={{
        display: 'flex',
        flexDirection,
        alignItems: getAlignItems(),
        justifyContent: getJustifyContent(),
        gap: `${spacing * 8}px`, // MUI usa 8px como base
        width: fullWidth ? '100%' : 'auto',
        
        // Espaçamento específico para mobile
        ...(isMobile && {
          gap: `${Math.max(spacing, 1) * 8}px`, // Mínimo de 8px em mobile
        }),
        
        // Remove margens dos botões filhos já que usamos gap
        '& > *': {
          margin: '0 !important',
          ...(fullWidth && flexDirection === 'column' && {
            width: '100%',
          }),
        },
        
        // Responsividade adicional
        '@media (max-width: 480px)': {
          flexDirection: 'column',
          '& > *': {
            width: fullWidth ? '100%' : 'auto',
          },
        },
        
        ...props.sx,
      }}
    >
      {children}
    </Box>
  );
};

export default ButtonGroup;