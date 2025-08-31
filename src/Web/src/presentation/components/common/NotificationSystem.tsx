import React from 'react';
import { Snackbar, Alert, Slide } from '@mui/material';
import type { AlertProps } from '@mui/material/Alert';
import { useUIStore } from '../../../application/stores/uiStore';

function SlideTransition(props: any) {
  return <Slide {...props} direction="up" />;
}

const NotificationSystem: React.FC = () => {
  const { notifications, removeNotification } = useUIStore();

  const handleClose = (id: string) => {
    removeNotification(id);
  };

  return (
    <>
      {notifications.map((notification, index) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={5000}
          onClose={() => handleClose(notification.id)}
          TransitionComponent={SlideTransition}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{
            mb: index * 7, // Stack notifications
          }}
        >
          <Alert
            onClose={() => handleClose(notification.id)}
            severity={notification.type as AlertProps['severity']}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
};

export default NotificationSystem;
