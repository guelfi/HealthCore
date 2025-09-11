import type { Theme } from '@mui/material/styles';
import type { SxProps } from '@mui/system';

// Estilos padronizados para cards das páginas [Entidades]PageTable - HealthCore Design
export const standardCardStyles: SxProps<Theme> = {
  boxShadow: '0 4px 20px rgba(37, 99, 235, 0.08), 0 1px 3px rgba(0, 0, 0, 0.1)',
  borderRadius: 4,
  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
  border: '1px solid rgba(226, 232, 240, 0.6)',
  minHeight: '320px',
  width: '100%',
  maxWidth: '100%',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '4px',
    height: '100%',
    background: 'linear-gradient(180deg, #2563eb 0%, #3b82f6 100%)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover': {
    transform: 'translateY(-6px) scale(1.02)',
    boxShadow: '0 12px 40px rgba(37, 99, 235, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)',
    '&::before': {
      opacity: 1,
    },
  },
};

// Estilos padronizados para o conteúdo dos cards - HealthCore Design
export const standardCardContentStyles: SxProps<Theme> = {
  p: { xs: 2, sm: 2.5 },
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  position: 'relative',
  '& .MuiTypography-root': {
    lineHeight: 1.4,
  },
  '& .MuiTypography-h6': {
    color: '#1e293b',
    fontWeight: 600,
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: -20,
    right: -20,
    width: '60px',
    height: '60px',
    background: 'radial-gradient(circle, rgba(37, 99, 235, 0.05) 0%, transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none',
  },
};

// Estilos padronizados para botões de ação nos dialogs
export const standardDialogButtonStyles = {
  // Botão Excluir
  delete: {
    variant: 'outlined' as const,
    color: 'error' as const,
    size: 'small' as const,
    sx: {
      height: '32px',
      padding: '3px 12px',
      minWidth: '80px',
      borderRadius: '6px',
      fontWeight: 500,
      textTransform: 'none' as const,
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
      },
    },
  },
  // Botão Salvar - HealthCore Design
  save: {
    variant: 'contained' as const,
    size: 'small' as const,
    sx: {
      height: '36px',
      padding: '6px 16px',
      minWidth: '90px',
      borderRadius: '8px',
      fontWeight: 600,
      textTransform: 'none' as const,
      background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #1e40af 100%)',
      backgroundSize: '200% 200%',
      color: '#ffffff',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
        transition: 'left 0.5s ease',
      },
      '&:hover': {
        background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #1e3a8a 100%)',
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(37, 99, 235, 0.4)',
        '&::before': {
          left: '100%',
        },
      },
    },
  },
  // Botão Fechar
  close: {
    variant: 'outlined' as const,
    size: 'small' as const,
    sx: {
      height: '32px',
      padding: '3px 12px',
      minWidth: '80px',
      borderRadius: '6px',
      fontWeight: 500,
      textTransform: 'none' as const,
      borderColor: 'grey.400',
      color: 'grey.700',
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        borderColor: 'grey.600',
        backgroundColor: 'grey.50',
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
    },
  },
};

// Estilos padronizados para DialogActions
export const standardDialogActionsStyles: SxProps<Theme> = {
  p: 1.5,
  gap: 1,
  justifyContent: 'flex-end',
  borderTop: '1px solid',
  borderColor: 'divider',
  backgroundColor: 'grey.50',
};

// Estilos padronizados para DialogTitle
export const standardDialogTitleStyles: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  fontWeight: 600,
};

// Estilos padronizados para o botão "Adicionar" principal - HealthCore Design
export const standardAddButtonStyles: SxProps<Theme> = {
  background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #1e40af 100%)',
  backgroundSize: '200% 200%',
  color: '#ffffff',
  fontWeight: 600,
  borderRadius: '12px',
  padding: '12px 24px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
    transition: 'left 0.5s ease',
  },
  '&:hover': {
    background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #1e3a8a 100%)',
    backgroundPosition: '100% 50%',
    transform: 'translateY(-3px)',
    boxShadow: '0 8px 25px rgba(37, 99, 235, 0.4), 0 4px 12px rgba(0, 0, 0, 0.1)',
    '&::before': {
      left: '100%',
    },
  },
  '&:active': {
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)',
  },
};