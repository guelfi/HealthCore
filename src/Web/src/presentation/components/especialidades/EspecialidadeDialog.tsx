import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Alert,
  Box,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Especialidade, CreateEspecialidadeDto, UpdateEspecialidadeDto } from '../../../domain/entities/Especialidade';

// Schema de validação
const especialidadeSchema = z.object({
  nome: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  descricao: z.string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional(),
  ativa: z.boolean(),
});

type EspecialidadeFormData = z.infer<typeof especialidadeSchema>;

interface EspecialidadeDialogProps {
  open: boolean;
  onClose: () => void;
  especialidade?: Especialidade | null;
  mode: 'create' | 'edit';
  onSave: (data: CreateEspecialidadeDto | UpdateEspecialidadeDto) => Promise<Especialidade>;
}

const EspecialidadeDialog: React.FC<EspecialidadeDialogProps> = ({
  open,
  onClose,
  especialidade,
  mode,
  onSave,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<EspecialidadeFormData>({
    resolver: zodResolver(especialidadeSchema),
    defaultValues: {
      nome: '',
      descricao: '',
      ativa: true,
    },
    mode: 'onChange',
  });

  // Reset form when dialog opens/closes or especialidade changes
  useEffect(() => {
    if (open) {
      if (especialidade && mode === 'edit') {
        reset({
          nome: especialidade.nome,
          descricao: especialidade.descricao || '',
          ativa: especialidade.ativa,
        });
      } else {
        reset({
          nome: '',
          descricao: '',
          ativa: true,
        });
      }
      setError(null);
    }
  }, [open, especialidade, mode, reset]);

  const onSubmit = async (data: EspecialidadeFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      await onSave(data);
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar especialidade';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

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
        {mode === 'create' ? 'Nova Especialidade' : 'Editar Especialidade'}
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ pt: 1 }}>
          <Controller
            name="nome"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nome *"
                fullWidth
                margin="normal"
                error={!!errors.nome}
                helperText={errors.nome?.message}
                disabled={loading}
                autoFocus
              />
            )}
          />

          <Controller
            name="descricao"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Descrição"
                fullWidth
                margin="normal"
                multiline
                rows={3}
                error={!!errors.descricao}
                helperText={errors.descricao?.message}
                disabled={loading}
              />
            )}
          />

          <Controller
            name="ativa"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    {...field}
                    checked={field.value}
                    disabled={loading}
                  />
                }
                label="Especialidade ativa"
                sx={{ mt: 2 }}
              />
            )}
          />
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
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={loading || !isValid}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? 'Salvando...' : mode === 'create' ? 'Criar' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EspecialidadeDialog;
