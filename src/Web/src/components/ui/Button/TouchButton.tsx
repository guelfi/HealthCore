import React from 'react';
import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { useResponsive } from '../../../presentation/hooks/useResponsive';

export interface TouchButtonProps extends Omit<MuiButtonProps, 'size'> {
  /** Variante do botão */
  variant?: 'contained' | 'outlined' | 'text';
  /** Tamanho do botão - otimizado para touch */
  size?: 'small' | 'medium' | 'large';
  /** Estado de loading */
  loading?: boolean;
  /** Feedback haptic em dispositivos suportados */
  hapticFeedback?: boolean;
  /** Ícone à esquerda do texto */
  startIcon?: React.ReactNode;
  /** Ícone à direita do texto */
  endIcon?: React.ReactNode;
  /** Cor do botão */
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  /** Largura total */
  fullWidth?: boolean;
  /** Classe CSS adicional */
  className?: string;
}

const TouchButton: React.FC<TouchButtonProps> = ({
  children,
  variant = 'contained',
  size = 'medium',
  loading = false,
  hapticFeedback = true,
  disabled,
  onClick,
  startIcon,
  endIcon,
  color = 'primary',
  fullWidth = false,
  className,
  ...props
}) => {
  const theme = useTheme();
  const { isMobile } = useResponsive();

  // Função para feedback haptic
  const triggerHapticFeedback = () => {
    if (hapticFeedback && isMobile && 'vibrate' in navigator) {
      // Vibração sutil para feedback
      navigator.vibrate(10);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    
    // Trigger haptic feedback
    triggerHapticFeedback();
    
    // Chama o onClick original
    if (onClick) {
      onClick(event);
    }
  };

  // Configurações de tamanho otimizadas para touch
  const getSizeConfig = () => {
    const baseConfig = {
      small: {
        minHeight: 40,
        minWidth: 40,
        padding: '8px 16px',
        fontSize: '0.875rem',
      },
      medium: {
        minHeight: 44, // Mínimo recomendado para touch
        minWidth: 44,
        padding: '10px 20px',
        fontSize: '0.95rem',
      },
      large: {
        minHeight: 48,
        minWidth: 48,
        padding: '12px 24px',
        fontSize: '1rem',
      },
    };

    return baseConfig[size];
  };

  const sizeConfig = getSizeConfig();

  return (
    <MuiButton
      {...props}
      variant={variant}
      color={color}
      disabled={disabled || loading}
      onClick={handleClick}
      fullWidth={fullWidth}
      className={`touch-button ${className || ''}`}
      startIcon={loading ? undefined : startIcon}
      endIcon={loading ? undefined : endIcon}
      sx={{
        // Configurações de tamanho
        minHeight: sizeConfig.minHeight,
        minWidth: sizeConfig.minWidth,
        padding: sizeConfig.padding,
        fontSize: sizeConfig.fontSize,
        
        // Espaçamento entre botões adjacentes
        '&:not(:last-child)': {
          marginRight: isMobile ? '8px' : '12px',
          marginBottom: isMobile ? '8px' : '0px',
        },
        
        // Feedback visual para touch
        transition: 'all 0.2s ease-in-out',
        
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: theme.shadows[4],
        },
        
        '&:active': {
          transform: 'scale(0.98)',
          transition: 'transform 0.1s ease-in-out',
        },
        
        // Estados de focus para acessibilidade
        '&:focus-visible': {
          outline: `2px solid ${theme.palette[color].main}`,
          outlineOffset: '2px',
        },
        
        // Estado loading
        ...(loading && {
          color: 'transparent',
          pointerEvents: 'none',
        }),
        
        // Estado disabled
        '&.Mui-disabled': {
          opacity: 0.6,
          cursor: 'not-allowed',
        },
        
        // Ripple effect customizado
        '& .MuiTouchRipple-root': {
          color: theme.palette[color].main,
        },
        
        // Responsividade adicional
        ...(isMobile && {
          fontSize: sizeConfig.fontSize,
          padding: sizeConfig.padding,
        }),
        
        ...props.sx,
      }}
    >
      {loading && (
        <CircularProgress
          size={20}
          sx={
            position: 'absolute',
            color: variant === 'contained' 
              ? theme.palette[color].contrastText 
              : theme.palette[color].main,
          }
        />
      )}
      {children}
    </MuiButton>
  );
};

export default TouchButton;