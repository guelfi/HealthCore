import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { MedicalServices, Warning } from '@mui/icons-material';
import type { Especialidade } from '../../../domain/entities';

interface EspecialidadeDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  especialidade?: Especialidade | null;
  onConfirm: (id: string) => Promise<void>;
}

const EspecialidadeDeleteDialog: React.FC<EspecialidadeDeleteDialogProps> = ({
  open,
  onClose,
  especialidade,
  onConfirm,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!especialidade) return;

    try {
      setLoading(true);
      setError(null);
      
      await onConfirm(especialidade.id);
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir especialidade';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  if (!especialidade) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: isMobile ? { m: 0, borderRadius: 0 } : {}
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <Warning color="error" sx={{ mr: 1 }} />
          Confirmar Exclusão
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ pt: 1 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Tem certeza que deseja excluir a especialidade:
          </Typography>

          <Box
            sx={{
              p: 2,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              bgcolor: 'background.paper',
            }}
          >
            <Box display="flex" alignItems="center" mb={1}>
              <MedicalServices sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" component="div">
                {especialidade.nome}
              </Typography>
            </Box>
            
            {especialidade.descricao && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {especialidade.descricao}
              </Typography>
            )}
            
            <Typography variant="caption" color="text.secondary">
              Status: {especialidade.ativa ? 'Ativa' : 'Inativa'} | 
              Criada em: {new Date(especialidade.dataCriacao).toLocaleDateString('pt-BR')}
            </Typography>
          </Box>

          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Atenção:</strong> Esta ação não pode ser desfeita. 
              A especialidade será permanentemente removida do sistema.
            </Typography>
          </Alert>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          color="error"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? 'Excluindo...' : 'Excluir'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EspecialidadeDeleteDialog;
