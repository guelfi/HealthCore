import type { Theme } from '@mui/material/styles';
import type { SxProps } from '@mui/system';

// Estilos padronizados para cards das páginas [Entidades]PageTable
export const standardCardStyles: SxProps<Theme> = {
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  borderRadius: 3,
  // Redução de 20% na altura
  minHeight: '320px', // Reduzido de 400px para 320px (20% menor)
  // Formato mais retangular e comprido
  width: '100%',
  maxWidth: '100%',
  // Efeito hover com movimentação
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px) scale(1.02)',
    boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
  },
};

// Estilos padronizados para o conteúdo dos cards
export const standardCardContentStyles: SxProps<Theme> = {
  p: { xs: 1.5, sm: 2 },
  // Ajuste automático do texto à altura reduzida
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  '& .MuiTypography-root': {
    lineHeight: 1.3, // Texto mais compacto
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
  // Botão Salvar
  save: {
    variant: 'contained' as const,
    size: 'small' as const,
    sx: {
      height: '32px',
      padding: '3px 12px',
      minWidth: '80px',
      borderRadius: '6px',
      fontWeight: 500,
      textTransform: 'none' as const,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 8px rgba(102, 126, 234, 0.4)',
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

// Estilos padronizados para o botão "Adicionar" principal
export const standardAddButtonStyles: SxProps<Theme> = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
  },
};