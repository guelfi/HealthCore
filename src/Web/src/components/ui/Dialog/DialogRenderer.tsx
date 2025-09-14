import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Slide,
  Fade,
  useTheme,
  useMediaQuery,
  Box
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';
import { useDialog, DialogConfig } from '../../../contexts/DialogContext';
import { TouchButton } from '../Button';
import { useResponsive } from '../../../hooks/useResponsive';

// Transições personalizadas
const SlideUpTransition = React.forwardRef<
  unknown,
  TransitionProps & { children: React.ReactElement }
>((props, ref) => {
  return <Slide direction="up" ref={ref} {...props} />;
});

const FadeTransition = React.forwardRef<
  unknown,
  TransitionProps & { children: React.ReactElement }
>((props, ref) => {
  return <Fade ref={ref} {...props} />;
});

export interface DialogRendererProps {
  dialog: DialogConfig;
}

export const DialogRenderer: React.FC<DialogRendererProps> = ({ dialog }) => {
  const theme = useTheme();
  const { closeDialog } = useDialog();
  const { isMobile, isTablet } = useResponsive();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const handleClose = () => {
    if (!dialog.persistent) {
      closeDialog(dialog.id);
    }
  };

  const handleConfirm = async () => {
    if (dialog.onConfirm) {
      try {
        await dialog.onConfirm();
      } catch (error) {
        console.error('Error in dialog confirm:', error);
      }
    }
  };

  const handleCancel = () => {
    if (dialog.onCancel) {
      dialog.onCancel();
    } else {
      closeDialog(dialog.id);
    }
  };

  // Renderização para Alert
  if (dialog.type === 'alert') {
    return (
      <Dialog
        open={true}
        onClose={handleClose}
        TransitionComponent={FadeTransition}
        maxWidth={dialog.maxWidth || 'sm'}
        fullWidth
        fullScreen={dialog.fullScreen || (isMobile && !dialog.maxWidth)}
        className={`dialog-alert ${dialog.className || ''}`}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : theme.spacing(2),
            margin: isMobile ? 0 : theme.spacing(2),
          }
        }}
      >
        {dialog.title && (
          <DialogTitle sx={{ pb: 1 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" component="div">
                {dialog.title}
              </Typography>
              {dialog.showCloseButton && (
                <IconButton
                  onClick={handleClose}
                  size="small"
                  sx={{ ml: 1 }}
                >
                  <Close />
                </IconButton>
              )}
            </Box>
          </DialogTitle>
        )}
        <DialogContent>
          {dialog.message && (
            <Typography variant="body1" color="textSecondary">
              {dialog.message}
            </Typography>
          )}
          {dialog.content}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <TouchButton
            onClick={handleConfirm}
            variant="contained"
            color="primary"
            fullWidth={isMobile}
            size={isMobile ? 'large' : 'medium'}
          >
            {dialog.confirmText || 'OK'}
          </TouchButton>
        </DialogActions>
      </Dialog>
    );
  }

  // Renderização para Confirm
  if (dialog.type === 'confirm') {
    return (
      <Dialog
        open={true}
        onClose={handleClose}
        TransitionComponent={FadeTransition}
        maxWidth={dialog.maxWidth || 'sm'}
        fullWidth
        fullScreen={dialog.fullScreen || (isMobile && !dialog.maxWidth)}
        className={`dialog-confirm ${dialog.className || ''}`}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : theme.spacing(2),
            margin: isMobile ? 0 : theme.spacing(2),
          }
        }}
      >
        {dialog.title && (
          <DialogTitle sx={{ pb: 1 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" component="div">
                {dialog.title}
              </Typography>
              {dialog.showCloseButton && (
                <IconButton
                  onClick={handleClose}
                  size="small"
                  sx={{ ml: 1 }}
                >
                  <Close />
                </IconButton>
              )}
            </Box>
          </DialogTitle>
        )}
        <DialogContent>
          {dialog.message && (
            <Typography variant="body1" color="textSecondary">
              {dialog.message}
            </Typography>
          )}
          {dialog.content}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1, gap: 1 }}>
          {isMobile ? (
            <Box display="flex" flexDirection="column" width="100%" gap={1}>
              <TouchButton
                onClick={handleConfirm}
                variant="contained"
                color="primary"
                fullWidth
                size="large"
              >
                {dialog.confirmText || 'Confirmar'}
              </TouchButton>
              <TouchButton
                onClick={handleCancel}
                variant="outlined"
                color="primary"
                fullWidth
                size="large"
              >
                {dialog.cancelText || 'Cancelar'}
              </TouchButton>
            </Box>
          ) : (
            <>
              <TouchButton
                onClick={handleCancel}
                variant="outlined"
                color="primary"
              >
                {dialog.cancelText || 'Cancelar'}
              </TouchButton>
              <TouchButton
                onClick={handleConfirm}
                variant="contained"
                color="primary"
              >
                {dialog.confirmText || 'Confirmar'}
              </TouchButton>
            </>
          )}
        </DialogActions>
      </Dialog>
    );
  }

  // Renderização para Modal
  if (dialog.type === 'modal') {
    return (
      <Dialog
        open={true}
        onClose={handleClose}
        TransitionComponent={FadeTransition}
        maxWidth={dialog.maxWidth || 'md'}
        fullWidth
        fullScreen={dialog.fullScreen || fullScreen}
        className={`dialog-modal ${dialog.className || ''}`}
        PaperProps={{
          sx: {
            borderRadius: (dialog.fullScreen || fullScreen) ? 0 : theme.spacing(2),
            margin: (dialog.fullScreen || fullScreen) ? 0 : theme.spacing(2),
            maxHeight: (dialog.fullScreen || fullScreen) ? '100vh' : 'calc(100vh - 64px)',
          }
        }}
      >
        {dialog.title && (
          <DialogTitle sx={{ pb: 1 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" component="div">
                {dialog.title}
              </Typography>
              <IconButton
                onClick={handleClose}
                size="small"
                sx={{ ml: 1 }}
              >
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
        )}
        <DialogContent sx={{ p: 0 }}>
          {dialog.message && (
            <Box sx={{ p: 2 }}>
              <Typography variant="body1" color="textSecondary">
                {dialog.message}
              </Typography>
            </Box>
          )}
          {dialog.content}
        </DialogContent>
      </Dialog>
    );
  }

  // Renderização para BottomSheet
  if (dialog.type === 'bottomSheet') {
    return (
      <Dialog
        open={true}
        onClose={handleClose}
        TransitionComponent={SlideUpTransition}
        fullWidth
        className={`dialog-bottom-sheet ${dialog.className || ''}`}
        PaperProps={{
          sx: {
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            margin: 0,
            borderRadius: `${theme.spacing(2)} ${theme.spacing(2)} 0 0`,
            maxHeight: '80vh',
            minHeight: '200px',
          }
        }}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }
        }}
      >
        {/* Handle para arrastar */}
        <Box
          sx={{
            width: 40,
            height: 4,
            backgroundColor: theme.palette.grey[300],
            borderRadius: 2,
            margin: '8px auto 16px',
            cursor: 'pointer',
          }}
          onClick={handleClose}
        />
        
        {dialog.title && (
          <DialogTitle sx={{ pt: 0, pb: 1 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" component="div">
                {dialog.title}
              </Typography>
              <IconButton
                onClick={handleClose}
                size="small"
                sx={{ ml: 1 }}
              >
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
        )}
        <DialogContent sx={{ pb: 2 }}>
          {dialog.message && (
            <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
              {dialog.message}
            </Typography>
          )}
          {dialog.content}
        </DialogContent>
      </Dialog>
    );
  }

  return null;
};

export default DialogRenderer;