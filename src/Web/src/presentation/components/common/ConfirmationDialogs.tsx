import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Slide,
  Fade,
  useTheme,
} from '@mui/material';
import {
  CheckCircle,
  Warning,
  Error,
  Info,
} from '@mui/icons-material';
import { type TransitionProps } from '@mui/material/transitions';

const SlideTransition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'success' | 'warning' | 'error' | 'info';
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  type = 'warning',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  loading = false,
}) => {
  const theme = useTheme();

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle sx={{ color: '#4CAF50', fontSize: 48 }} />;
      case 'error':
        return <Error sx={{ color: '#f44336', fontSize: 48 }} />;
      case 'warning':
        return <Warning sx={{ color: '#ff9800', fontSize: 48 }} />;
      default:
        return <Info sx={{ color: '#2196f3', fontSize: 48 }} />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return { primary: '#4CAF50', light: '#E8F5E8' };
      case 'error':
        return { primary: '#f44336', light: '#FFEBEE' };
      case 'warning':
        return { primary: '#ff9800', light: '#FFF3E0' };
      default:
        return { primary: '#2196f3', light: '#E3F2FD' };
    }
  };

  const colors = getColors();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={SlideTransition}
      maxWidth="sm"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 3,
          overflow: 'visible',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Card elevation={0} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            {/* Ícone */}
            <Box sx={{ mb: 2 }}>{getIcon()}</Box>

            {/* Título */}
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              sx={{
                fontWeight: 600,
                color: colors.primary,
                mb: 1,
              }}
            >
              {title}
            </Typography>

            {/* Mensagem */}
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                mb: 3,
                lineHeight: 1.6,
              }}
            >
              {message}
            </Typography>
          </CardContent>
        </Card>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={loading}
          sx={{
            borderColor: theme.palette.grey[300],
            color: theme.palette.text.secondary,
            '&:hover': {
              borderColor: theme.palette.grey[400],
              backgroundColor: theme.palette.grey[50],
            },
          }}
        >
          {cancelText}
        </Button>

        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={loading}
          sx={{
            backgroundColor: colors.primary,
            '&:hover': {
              backgroundColor: colors.primary,
              filter: 'brightness(0.9)',
            },
          }}
        >
          {loading ? 'Processando...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Diálogo específico para exclusão
interface DeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType?: string;
  loading?: boolean;
}

export const DeleteConfirmationDialog: React.FC<
  DeleteConfirmationDialogProps
> = ({
  open,
  onClose,
  onConfirm,
  itemName,
  itemType = 'item',
  loading = false,
}) => {
  return (
    <ConfirmationDialog
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      type="error"
      title="Confirmar Exclusão"
      message={`Tem certeza que deseja excluir ${itemType} "${itemName}"? Esta ação não pode ser desfeita.`}
      confirmText={loading ? 'Excluindo...' : 'Excluir'}
      cancelText="Cancelar"
      loading={loading}
    />
  );
};

// Dialog de sucesso para operações
interface SuccessDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export const SuccessDialog: React.FC<SuccessDialogProps> = ({
  open,
  onClose,
  title,
  message,
  autoClose = true,
  autoCloseDelay = 2000,
}) => {
  React.useEffect(() => {
    if (open && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [open, autoClose, autoCloseDelay, onClose]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Fade}
      maxWidth="sm"
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 3,
          overflow: 'visible',
          boxShadow: '0 8px 32px rgba(76, 175, 80, 0.2)',
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Card
          elevation={0}
          sx={{ borderRadius: 3, backgroundColor: '#E8F5E8' }}
        >
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            {/* Ícone de sucesso */}
            <Box sx={{ mb: 2 }}>
              <CheckCircle sx={{ color: '#4CAF50', fontSize: 64 }} />
            </Box>

            {/* Título */}
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              sx={{
                fontWeight: 600,
                color: '#2E7D32',
                mb: 1,
              }}
            >
              {title}
            </Typography>

            {/* Mensagem */}
            <Typography
              variant="body1"
              sx={{
                color: '#1B5E20',
                lineHeight: 1.6,
              }}
            >
              {message}
            </Typography>

            {autoClose && (
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mt: 2,
                  color: '#4CAF50',
                  fontStyle: 'italic',
                }}
              >
                Fechando automaticamente...
              </Typography>
            )}
          </CardContent>
        </Card>
      </DialogContent>

      {!autoClose && (
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={onClose}
            variant="contained"
            sx={{
              backgroundColor: '#4CAF50',
              '&:hover': {
                backgroundColor: '#45A049',
              },
            }}
          >
            OK
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

// Dialog de erro informativo e acessível
interface ErrorInfoDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  reason?: string;
  actions?: Array<{ label: string; onClick: () => void }>;
}

export const ErrorInfoDialog: React.FC<ErrorInfoDialogProps> = ({
  open,
  onClose,
  title = 'Não foi possível excluir',
  reason,
  actions = [],
}) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={SlideTransition}
      maxWidth="sm"
      fullWidth
      aria-labelledby="error-info-title"
      aria-describedby="error-info-description"
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 3,
          overflow: 'visible',
          boxShadow: '0 8px 32px rgba(244, 67, 54, 0.18)',
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Card elevation={0} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <Box sx={{ mb: 2 }}>
              <Error sx={{ color: theme.palette.error.main, fontSize: 56 }} />
            </Box>
            <Typography
              id="error-info-title"
              variant="h5"
              component="h2"
              gutterBottom
              sx={{ fontWeight: 600, color: theme.palette.error.main }}
            >
              {title}
            </Typography>
            {reason && (
              <Typography
                id="error-info-description"
                variant="body1"
                color="text.secondary"
                sx={{ mb: 3, lineHeight: 1.6 }}
              >
                {reason}
              </Typography>
            )}
          </CardContent>
        </Card>
      </DialogContent>
      <DialogActions sx={{ p: 3, gap: 1, justifyContent: 'center' }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: theme.palette.grey[300],
            color: theme.palette.text.secondary,
            '&:hover': { borderColor: theme.palette.grey[400], backgroundColor: theme.palette.grey[50] },
          }}
        >
          Fechar
        </Button>
        {actions.map((action, idx) => (
          <Button
            key={idx}
            onClick={action.onClick}
            variant="contained"
            color="primary"
          >
            {action.label}
          </Button>
        ))}
      </DialogActions>
    </Dialog>
  );
};

export default {
  ConfirmationDialog,
  DeleteConfirmationDialog,
  SuccessDialog,
  ErrorInfoDialog,
};
