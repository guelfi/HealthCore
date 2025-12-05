import React from 'react';
import { Snackbar, Alert, Slide, Button, useMediaQuery } from '@mui/material';
import type { AlertProps } from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import { useUIStore } from '../../../application/stores/uiStore';

function SlideTransitionFactory(direction: 'up' | 'down') {
  return function SlideTransition(props: any) {
    return <Slide {...props} direction={direction} />;
  };
}

const NotificationSystem: React.FC = () => {
  const { notifications, removeNotification } = useUIStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleClose = (id: string) => {
    removeNotification(id);
  };

  return (
    <>
      {notifications.map((notification, index) => {
        const duration = notification.duration ?? 5000;
        const anchorOrigin = notification.position ?? (
          isMobile
            ? { vertical: 'top', horizontal: 'center' }
            : { vertical: 'top', horizontal: 'right' }
        );
        const TransitionComponent = SlideTransitionFactory(
          anchorOrigin.vertical === 'top' ? 'down' : 'up'
        );

        return (
          <Snackbar
            key={notification.id}
            open={true}
            autoHideDuration={duration}
            onClose={() => handleClose(notification.id)}
            TransitionComponent={TransitionComponent}
            anchorOrigin={anchorOrigin}
            sx={{
              mb: index * 7,
            }}
          >
            <Alert
              role="alert"
              aria-live={notification.ariaLive ?? 'polite'}
              onClose={() => handleClose(notification.id)}
              severity={notification.type as AlertProps['severity']}
              variant="filled"
              sx={{ width: '100%' }}
              action={
                notification.action ? (
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => {
                      try {
                        notification.action?.onClick?.();
                      } finally {
                        // Não fechar automaticamente ao clicar em ação; responsabilidade do callback
                      }
                    }}
                  >
                    {notification.action.label}
                  </Button>
                ) : undefined
              }
            >
              {notification.message}
            </Alert>
          </Snackbar>
        );
      })}
    </>
  );
};

export default NotificationSystem;
