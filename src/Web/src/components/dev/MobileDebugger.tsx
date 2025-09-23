import React, { useState } from 'react';
import {
  Box,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Chip,
  IconButton,
} from '@mui/material';
import {
  BugReport,
  Close,
  Smartphone,
  Tablet,
  Computer,
} from '@mui/icons-material';
import { useResponsive } from '../../presentation/hooks/useResponsive';

interface MobileDebuggerProps {
  enabled?: boolean;
}

const MobileDebugger: React.FC<MobileDebuggerProps> = ({ 
  enabled = process.env.NODE_ENV === 'development' 
}) => {
  const [open, setOpen] = useState(false);
  const {
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    isPortrait,
    screenSize,
    deviceType,
  } = useResponsive();

  if (!enabled) return null;

  return (
    <>
      <Fab
        color="secondary"
        onClick={() => setOpen(true)}
        size="small"
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 9999,
          opacity: 0.7,
        }}
      >
        <BugReport />
      </Fab>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
          Debug Mobile
          <IconButton onClick={() => setOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="h6" gutterBottom>Device Info</Typography>
          <Typography>Type: {deviceType}</Typography>
          <Typography>Size: {screenSize.width}x{screenSize.height}</Typography>
          <Typography>Orientation: {isPortrait ? 'Portrait' : 'Landscape'}</Typography>
          
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip label="Mobile" color={isMobile ? 'success' : 'default'} icon={<Smartphone />} />
            <Chip label="Tablet" color={isTablet ? 'success' : 'default'} icon={<Tablet />} />
            <Chip label="Desktop" color={isDesktop ? 'success' : 'default'} icon={<Computer />} />
            <Chip label="Touch" color={isTouchDevice ? 'success' : 'default'} />
          </Box>
          
          <Typography variant="h6" sx={{ mt: 2 }} gutterBottom>Network</Typography>
          <Typography variant="body2">URL: {window.location.href}</Typography>
          <Typography variant="body2">Online: {navigator.onLine ? 'Yes' : 'No'}</Typography>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MobileDebugger;
