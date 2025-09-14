import React from 'react';
import { Portal } from '@mui/material';
import { useDialog } from '../../../contexts/DialogContext';
import { DialogRenderer } from './DialogRenderer';

export const DialogContainer: React.FC = () => {
  const { dialogs } = useDialog();

  if (dialogs.length === 0) {
    return null;
  }

  return (
    <Portal>
      {dialogs.map((dialog) => (
        <DialogRenderer key={dialog.id} dialog={dialog} />
      ))}
    </Portal>
  );
};

export default DialogContainer;