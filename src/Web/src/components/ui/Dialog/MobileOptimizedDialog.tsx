import React from 'react';
import {
  Dialog,
  type DialogProps,
  useTheme,
  useMediaQuery,
  Slide,
  Grow,
  Box,
} from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';
import { useResponsive } from '../../../presentation/hooks/useResponsive';

interface MobileOptimizedDialogProps extends Omit<DialogProps, 'children'> {
  children: React.ReactNode;
  enableBottomSheet?: boolean;
  enableSwipeToClose?: boolean;
  mobileFullScreen?: boolean;
  touchOptimized?: boolean;
}

// Transição slide up para bottom sheet
const SlideUpTransition = React.forwardRef<
  unknown,
  TransitionProps & { children: React.ReactElement }
>((props, ref) => {
 return <Slide direction="up" ref={ref} {...props} />;
});

SlideUpTransition.displayName = 'SlideUpTransition';

// Transição grow para desktop
const GrowTransition = React.forwardRef<
  unknown,
  TransitionProps & { children: React.ReactElement }
>((props, ref) => {
  return <Grow ref={ref} {...props} />;
});

GrowTransition.displayName = 'GrowTransition';

const MobileOptimizedDialog: React.FC<MobileOptimizedDialogProps> = ({
  children,
  enableBottomSheet = true,
  enableSwipeToClose = true,
  mobileFullScreen = false,
  touchOptimized = true,
  fullScreen,
  maxWidth = 'sm',
  TransitionComponent,
  PaperProps,
  sx,
  ...props
}) => {
  const theme = useTheme();
  const { isMobile, isTablet, isTouchDevice } = useResponsive();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  // Determinar se deve usar bottom sheet
  const useBottomSheet = enableBottomSheet && isMobile;
  
  // Determinar se deve ser fullscreen
  const shouldBeFullScreen = mobileFullScreen && isSmallScreen;
  
  // Selecionar transição apropriada
  const getTransitionComponent = () => {
    if (TransitionComponent) return TransitionComponent;
    return useBottomSheet ? SlideUpTransition : GrowTransition;
  };

  // Estilos otimizados para mobile
  const getMobileOptimizedStyles = () => {
    const baseStyles = {
      '& .MuiDialog-container': {
        ...(useBottomSheet && {
          alignItems: 'flex-end',
        }),
      },
      '& .MuiDialog-paper': {
        // Bottom sheet styles
        ...(useBottomSheet && {
          margin: 0,
          borderRadius: '16px 16px 0 0',
          maxHeight: '90vh',
          minHeight: '200px',
          width: '100%',
          position: 'relative',
        }),
        
        // Mobile responsive
        ...(isMobile && !useBottomSheet && {
          margin: 8,
          width: 'calc(100% - 16px)',
          maxWidth: 'none',
        }),
        
        // Touch optimizations
        ...(touchOptimized && {
          '& .MuiDialogTitle-root': {
            minHeight: 64, // Altura mínima para touch
            display: 'flex',
            alignItems: 'center',
            paddingY: 2,
          },
          '& .MuiDialogActions-root': {
            padding: 16,
            gap: 12,
            '& .MuiButton-root': {
              minHeight: 48, // Botões touch-friendly
              minWidth: 88,
              borderRadius: 24,
            },
          },
          '& .MuiDialogContent-root': {
            paddingX: { xs: 16, sm: 24 },
            paddingY: { xs: 16, sm: 20 },
          },
        }),
      },
      
      // Backdrop otimizado para mobile
      '& .MuiBackdrop-root': {
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        ...(isTouchDevice && {
          backdropFilter: 'blur(2px)',
        }),
      },
    };

    return baseStyles;
  };

  return (
    <>
      <Dialog
        {...props}
        fullScreen={shouldBeFullScreen || fullScreen}
        maxWidth={useBottomSheet ? false : maxWidth}
        TransitionComponent={getTransitionComponent()}
        sx={{
          ...getMobileOptimizedStyles(),
          ...sx,
        }}
        PaperProps={{
          ...PaperProps,
          ...(useBottomSheet && enableSwipeToClose && {
            onTouchStart: (e: React.TouchEvent) => {
              const touch = e.touches[0];
              const startY = touch.clientY;
              
              const handleTouchMove = (moveEvent: TouchEvent) => {
                const currentTouch = moveEvent.touches[0];
                const deltaY = currentTouch.clientY - startY;
                
                // Se arrastar para baixo mais de 100px, fechar dialog
                if (deltaY > 100) {
                  props.onClose?.({}, 'backdropClick');
                  document.removeEventListener('touchmove', handleTouchMove);
                  document.removeEventListener('touchend', handleTouchEnd);
                }
              };
              
              const handleTouchEnd = () => {
                document.removeEventListener('touchmove', handleTouchMove);
                document.removeEventListener('touchend', handleTouchEnd);
              };
              
              document.addEventListener('touchmove', handleTouchMove);
              document.addEventListener('touchend', handleTouchEnd);
            },
          }),
        }}
      >
        {/* Handle para arrastar (apenas em bottom sheet) */}
        {useBottomSheet && (
          <Box
            sx={{
              width: 40,
              height: 4,
              backgroundColor: theme.palette.divider,
              borderRadius: 2,
              margin: '8px auto 16px',
              cursor: 'grab',
              '&:active': {
                cursor: 'grabbing',
              },
            }}
          />
        )}
        
        {children}
      </Dialog>
    </>
  );
};

export default MobileOptimizedDialog;