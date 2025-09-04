import React from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import {
  Delete as DeleteIcon,
  Save as SaveIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface StandardDialogButtonsProps {
  // Botão Excluir
  showDelete?: boolean;
  onDelete?: () => void;
  deleteDisabled?: boolean;
  deleteLoading?: boolean;
  
  // Botão Salvar
  onSave: () => void;
  saveDisabled?: boolean;
  saveLoading?: boolean;
  saveText?: string; // "Salvar", "Adicionar", etc.
  
  // Botão Fechar
  onClose: () => void;
  closeDisabled?: boolean;
  
  // Layout
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between';
  gap?: number;
}

const StandardDialogButtons: React.FC<StandardDialogButtonsProps> = ({
  // Delete button props
  showDelete = false,
  onDelete,
  deleteDisabled = false,
  deleteLoading = false,
  
  // Save button props
  onSave,
  saveDisabled = false,
  saveLoading = false,
  saveText = 'Salvar',
  
  // Close button props
  onClose,
  closeDisabled = false,
  
  // Layout props
  justifyContent = 'flex-end',
  gap = 1,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        gap,
        justifyContent,
        p: 1.5,
        borderTop: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'grey.50',
      }}
    >
      {/* Botão Excluir - Vermelho */}
      {showDelete && (
        <Button
          onClick={onDelete}
          disabled={deleteDisabled || deleteLoading}
          variant="outlined"
          color="error"
          startIcon={deleteLoading ? <CircularProgress size={18} /> : <DeleteIcon sx={{ fontSize: 18 }} />}
          sx={{
            height: '40px',
            padding: '6px 20px',
            minWidth: '120px',
            borderRadius: '4px',
            fontWeight: 500,
            fontSize: '14px',
            textTransform: 'none',
            borderWidth: '2px',
            '&:hover': {
              backgroundColor: 'error.light',
              borderColor: 'error.main',
              borderWidth: '2px',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(211, 47, 47, 0.25)',
            },
            '&:disabled': {
              borderWidth: '2px',
              opacity: 0.6,
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          Excluir
        </Button>
      )}
      
      {/* Botão Salvar - Azul */}
      <Button
        onClick={onSave}
        disabled={saveDisabled || saveLoading}
        variant="contained"
        color="primary"
        startIcon={saveLoading ? <CircularProgress size={18} color="inherit" /> : <SaveIcon sx={{ fontSize: 18 }} />}
        sx={{
          height: '40px',
          padding: '6px 20px',
          minWidth: '120px',
          borderRadius: '4px',
          fontWeight: 500,
          fontSize: '14px',
          textTransform: 'none',
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.25)',
          },
          '&:disabled': {
            background: 'rgba(0, 0, 0, 0.12)',
            color: 'rgba(0, 0, 0, 0.26)',
          },
          transition: 'all 0.2s ease-in-out',
        }}
      >
        {saveLoading ? 'Salvando...' : saveText}
      </Button>
      
      {/* Botão Fechar - Cinza */}
      <Button
        onClick={onClose}
        disabled={closeDisabled}
        variant="outlined"
        color="inherit"
        startIcon={<CloseIcon sx={{ fontSize: 18 }} />}
        sx={{
          height: '40px',
          padding: '6px 20px',
          minWidth: '120px',
          borderRadius: '4px',
          fontWeight: 500,
          fontSize: '14px',
          textTransform: 'none',
          borderColor: 'grey.400',
          borderWidth: '2px',
          color: 'grey.700',
          '&:hover': {
            backgroundColor: 'grey.100',
            borderColor: 'grey.500',
            borderWidth: '2px',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          },
          '&:disabled': {
            borderWidth: '2px',
            opacity: 0.6,
          },
          transition: 'all 0.2s ease-in-out',
        }}
      >
        Fechar
      </Button>
    </Box>
  );
};

export default StandardDialogButtons;