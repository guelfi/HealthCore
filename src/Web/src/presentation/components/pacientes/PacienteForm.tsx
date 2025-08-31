import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import type {
  CreatePacienteDto,
  UpdatePacienteDto,
  Paciente,
} from '../../../domain/entities/Paciente';
import { useUIStore } from '../../../application/stores/uiStore';
import { usePacientes } from '../../hooks/usePacientes';

const pacienteSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  documento: z
    .string()
    .regex(
      /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
      'CPF deve estar no formato 000.000.000-00'
    ),
  dataNascimento: z.string().min(1, 'Data de nascimento é obrigatória'),
  telefone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  endereco: z.string().optional(),
});

type PacienteFormData = z.infer<typeof pacienteSchema>;

const PacienteForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addNotification } = useUIStore();
  const isEditing = Boolean(id);

  const {
    createPaciente,
    updatePaciente,
    getPacienteById,
    loading: apiLoading,
    error: _error,
  } = usePacientes();

  const [loading, setLoading] = React.useState(false);
  const [_pacienteData, setPacienteData] = React.useState<Paciente | null>(
    null
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<PacienteFormData>({
    resolver: zodResolver(pacienteSchema),
  });

  React.useEffect(() => {
    if (isEditing && id) {
      const loadPaciente = async () => {
        try {
          setLoading(true);
          const paciente = await getPacienteById(id);
          setPacienteData(paciente);

          setValue('nome', paciente.nome);
          setValue('documento', paciente.documento);
          setValue(
            'dataNascimento',
            new Date(paciente.dataNascimento).toISOString().split('T')[0]
          );
          setValue('telefone', paciente.telefone || '');
          setValue('email', paciente.email || '');
          setValue('endereco', paciente.endereco || '');
        } catch (error) {
          addNotification('Erro ao carregar dados do paciente', 'error');
          navigate('/pacientes');
        } finally {
          setLoading(false);
        }
      };

      loadPaciente();
    }
  }, [isEditing, id, setValue, getPacienteById, addNotification, navigate]);

  const onSubmit = async (data: PacienteFormData) => {
    setLoading(true);

    try {
      const pacienteData = {
        nome: data.nome,
        documento: data.documento,
        dataNascimento: new Date(data.dataNascimento),
        telefone: data.telefone,
        email: data.email,
        endereco: data.endereco,
      };

      if (isEditing && id) {
        await updatePaciente(id, pacienteData as UpdatePacienteDto);
        addNotification('Paciente atualizado com sucesso!', 'success');
      } else {
        await createPaciente(pacienteData as CreatePacienteDto);
        addNotification('Paciente cadastrado com sucesso!', 'success');
      }

      navigate('/pacientes');
    } catch (error: any) {
      addNotification(error.message || 'Erro ao salvar paciente', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/pacientes')}
          variant="outlined"
          size="small"
        >
          Voltar
        </Button>
        <Box>
          <Typography variant="h5" component="h1" sx={{ mb: 0.5 }}>
            {isEditing ? 'Editar Paciente' : 'Novo Paciente'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isEditing
              ? 'Atualize as informações do paciente'
              : 'Cadastre um novo paciente no sistema'}
          </Typography>
        </Box>
      </Box>

      <Card>
        <CardContent sx={{ p: { xs: 1, sm: 1.5 } }}>
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{
              maxWidth: { xs: '100%', sm: '600px' },
              mx: 'auto',
              mt: 1,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: { xs: 1, sm: 1.2 },
              }}
            >
              <TextField
                {...register('nome')}
                fullWidth
                label="Nome Completo *"
                error={!!errors.nome}
                helperText={errors.nome?.message}
                disabled={loading || apiLoading}
                size="small"
                sx={{
                  '& .MuiInputBase-root': {
                    padding: '4px 6px',
                  },
                  '& .MuiInputBase-input': {
                    padding: '4px 0',
                  },
                }}
              />

              {/* Linha com campos lado a lado */}
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <TextField
                  {...register('documento')}
                  label="CPF *"
                  placeholder="000.000.000-00"
                  error={!!errors.documento}
                  helperText={errors.documento?.message}
                  disabled={loading || apiLoading}
                  size="small"
                  sx={{
                    flex: '1 1 200px',
                    minWidth: '200px',
                    '& .MuiInputBase-root': {
                      padding: '4px 6px',
                    },
                    '& .MuiInputBase-input': {
                      padding: '4px 0',
                    },
                  }}
                  onChange={e => {
                    const formatted = formatCPF(e.target.value);
                    setValue('documento', formatted);
                  }}
                />

                <TextField
                  {...register('dataNascimento')}
                  label="Data de Nascimento *"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.dataNascimento}
                  helperText={errors.dataNascimento?.message}
                  disabled={loading || apiLoading}
                  size="small"
                  sx={{
                    flex: '1 1 180px',
                    minWidth: '180px',
                    '& .MuiInputBase-root': {
                      padding: '4px 6px',
                    },
                    '& .MuiInputBase-input': {
                      padding: '4px 0',
                    },
                  }}
                />
              </Box>

              {/* Segunda linha com telefone e email */}
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <TextField
                  {...register('telefone')}
                  label="Telefone"
                  placeholder="(11) 99999-9999"
                  error={!!errors.telefone}
                  helperText={errors.telefone?.message}
                  disabled={loading || apiLoading}
                  size="small"
                  sx={{
                    flex: '1 1 180px',
                    minWidth: '180px',
                    '& .MuiInputBase-root': {
                      padding: '4px 6px',
                    },
                    '& .MuiInputBase-input': {
                      padding: '4px 0',
                    },
                  }}
                  onChange={e => {
                    const formatted = formatPhone(e.target.value);
                    setValue('telefone', formatted);
                  }}
                />

                <TextField
                  {...register('email')}
                  label="Email"
                  type="email"
                  placeholder="paciente@email.com"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  disabled={loading || apiLoading}
                  size="small"
                  sx={{
                    flex: '1 1 220px',
                    minWidth: '220px',
                    '& .MuiInputBase-root': {
                      padding: '4px 6px',
                    },
                    '& .MuiInputBase-input': {
                      padding: '4px 0',
                    },
                  }}
                />
              </Box>

              <TextField
                {...register('endereco')}
                fullWidth
                label="Endereço"
                placeholder="Rua, número, bairro - Cidade/Estado"
                error={!!errors.endereco}
                helperText={errors.endereco?.message}
                disabled={loading || apiLoading}
                multiline
                rows={2}
                size="small"
                sx={{
                  '& .MuiInputBase-root': {
                    padding: '4px 6px',
                  },
                  '& .MuiInputBase-input': {
                    padding: '4px 0',
                  },
                }}
              />

              <Box display="flex" gap={2} justifyContent="flex-end" mt={1}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  disabled={loading || apiLoading}
                >
                  {loading || apiLoading ? 'Salvando...' : 'Salvar'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/pacientes')}
                  disabled={loading || apiLoading}
                >
                  Fechar
                </Button>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PacienteForm;
