import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { MedicalServices, CalendarToday, Update } from '@mui/icons-material';
import type { Especialidade } from '../../../domain/entities';

interface EspecialidadeViewDialogProps {
  open: boolean;
  onClose: () => void;
  especialidade?: Especialidade | null;
}

const EspecialidadeViewDialog: React.FC<EspecialidadeViewDialogProps> = ({
  open,
  onClose,
  especialidade,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!especialidade) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: isMobile ? { m: 0, borderRadius: 0 } : {}
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <MedicalServices sx={{ mr: 1, color: 'primary.main' }} />
          Detalhes da Especialidade
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 1 }}>
          {/* Nome e Status */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h5" component="div">
              {especialidade.nome}
            </Typography>
            <Chip
              label={especialidade.ativa ? 'Ativa' : 'Inativa'}
              color={especialidade.ativa ? 'success' : 'default'}
              variant="outlined"
            />
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Descrição */}
          {especialidade.descricao && (
            <Box mb={3}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Descrição
              </Typography>
              <Typography variant="body1">
                {especialidade.descricao}
              </Typography>
            </Box>
          )}

          {/* Informações do Sistema */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Informações do Sistema
            </Typography>
            
            <Box display="flex" alignItems="center" mb={1}>
              <CalendarToday sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                <strong>Criada em:</strong> {formatDate(especialidade.dataCriacao)}
              </Typography>
            </Box>

            {especialidade.dataAtualizacao && (
              <Box display="flex" alignItems="center" mb={1}>
                <Update sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  <strong>Última atualização:</strong> {formatDate(especialidade.dataAtualizacao)}
                </Typography>
              </Box>
            )}

            <Box display="flex" alignItems="center">
              <MedicalServices sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                <strong>ID:</strong> {especialidade.id}
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EspecialidadeViewDialog;
