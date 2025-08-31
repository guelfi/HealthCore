import React, { useState, useEffect } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Save, Visibility } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { ExameService } from '../../../application/services/ExameService';
import { PacienteService } from '../../../application/services/PacienteService';
import type { Exame, CreateExameDto, UpdateExameDto } from '../../../domain/entities/Exame';
import type { Paciente } from '../../../domain/entities/Paciente';
import { ModalidadeDicom, ModalidadeDicomLabels } from '../../../domain/enums/ModalidadeDicom';
import { useUIStore } from '../../../application/stores/uiStore';


// Definir o esquema de validação
const exameSchema = z.object({
  pacienteId: z.string().min(1, 'Paciente é obrigatório'),
  modalidade: z.nativeEnum(ModalidadeDicom).refine((val) => val !== undefined, {
    message: 'Modalidade é obrigatória',
  }),
  descricao: z.string().optional(),
  dataExame: z.string().min(1, 'Data do exame é obrigatória'),
});

type ExameFormData = z.infer<typeof exameSchema>;

interface ExameFormProps {
  mode: 'add' | 'edit';
  initialData?: Exame | null;
  onSaveSuccess?: () => void;
  onCancel?: () => void;
  onDelete?: (id: string) => void;
}

const ExameForm: React.FC<ExameFormProps> = ({ 
  mode, 
  initialData, 
  onSaveSuccess, 
  onCancel,
  onDelete
}) => {
  const navigate = useNavigate();
  const { id: _id } = useParams();
  const { addNotification } = useUIStore();
  const isEditing = mode === 'edit';
  
  const [loading, setLoading] = useState(false);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [pacientesLoading, setPacientesLoading] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [showPacienteDialog, setShowPacienteDialog] = useState(false);


  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ExameFormData>({
    resolver: zodResolver(exameSchema),
    defaultValues: {
      pacienteId: '',
      modalidade: ModalidadeDicom.CT,
      descricao: '',
      dataExame: new Date().toISOString().split('T')[0],
    }
  });

  const watchedPacienteId = watch('pacienteId');

  // Carregar pacientes
  useEffect(() => {
    const loadPacientes = async () => {
      setPacientesLoading(true);
      try {
        const response = await PacienteService.list({ page: 1, pageSize: 100 });
        setPacientes(response.data);
      } catch (error) {
        console.error('Erro ao carregar pacientes:', error);
        addNotification('Erro ao carregar lista de pacientes', 'error');
      } finally {
        setPacientesLoading(false);
      }
    };

    loadPacientes();
  }, [addNotification]);

  // Resetar formulário quando modo ou dados iniciais mudam
  useEffect(() => {
    if (isEditing && initialData) {
      // Modo edição - carregar dados do exame
      
      // Validar e formatar a data do exame
      let formattedDate;
      try {
        const examDate = new Date(initialData.dataExame);
        if (isNaN(examDate.getTime())) {
          formattedDate = new Date().toISOString().split('T')[0];
        } else {
          formattedDate = examDate.toISOString().split('T')[0];
        }
      } catch (error) {
        formattedDate = new Date().toISOString().split('T')[0];
      }
      
      // Usar reset para garantir que todos os valores sejam definidos corretamente
      reset({
        pacienteId: initialData.pacienteId,
        modalidade: initialData.modalidade,
        descricao: initialData.descricao || '',
        dataExame: formattedDate,
      });
      
      // Encontrar e definir o paciente selecionado
      const paciente = pacientes.find(p => p.id === initialData.pacienteId);
      if (paciente) {
        setSelectedPaciente(paciente);
      }
    } else {
      // Modo adição - resetar formulário
      reset({
        pacienteId: '',
        modalidade: ModalidadeDicom.CT,
        descricao: '',
        dataExame: new Date().toISOString().split('T')[0],
      });
      setSelectedPaciente(null);
    }
    
    // Limpar erros
    setFormError(null);
  }, [mode, initialData, setValue, pacientes]);

  // Atualizar paciente selecionado quando o ID mudar
  useEffect(() => {
    if (watchedPacienteId) {
      const paciente = pacientes.find(p => p.id === watchedPacienteId);
      setSelectedPaciente(paciente || null);
    }
  }, [watchedPacienteId, pacientes]);

  // Garantir que o paciente seja definido quando os pacientes são carregados
  useEffect(() => {
    if (isEditing && initialData && pacientes.length > 0 && !selectedPaciente) {
      const paciente = pacientes.find(p => p.id === initialData.pacienteId);
      if (paciente) {
        setSelectedPaciente(paciente);
      }
    }
  }, [pacientes, isEditing, initialData, selectedPaciente]);

  const onSubmit = async (data: ExameFormData) => {
    setLoading(true);
    setFormError(null);
    
    try {
      if (isEditing && initialData) {
        // Atualizar exame existente
        const updateData: UpdateExameDto = {
          pacienteId: data.pacienteId,
          modalidade: data.modalidade,
          descricao: data.descricao,
          dataExame: new Date(data.dataExame),
        };
        
        await ExameService.update(initialData.id, updateData);
        addNotification('Exame atualizado com sucesso!', 'success');
      } else {
        // Criar novo exame
        const createData: CreateExameDto = {
          pacienteId: data.pacienteId,
          modalidade: data.modalidade,
          descricao: data.descricao,
          dataExame: new Date(data.dataExame),
        };
        
        await ExameService.create(createData);
        addNotification('Exame cadastrado com sucesso!', 'success');
      }
      
      // Chamar callback de sucesso ou navegar
      if (onSaveSuccess) {
        onSaveSuccess();
      } else {
        navigate('/exames');
      }
    } catch (error: any) {
      console.error('Erro ao salvar exame:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Erro ao salvar exame';
      setFormError(errorMessage);
      addNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePacienteChange = (_event: any, newValue: Paciente | null) => {
    setSelectedPaciente(newValue);
    setValue('pacienteId', newValue?.id || '');
  };

  return (
    <>
      {formError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {formError}
        </Alert>
      )}
      
      <Box 
        component="form" 
        onSubmit={handleSubmit(onSubmit)}
        sx={{ 
          maxWidth: { xs: '100%', sm: '600px' },
          mx: 'auto'
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1, sm: 1.2 }, mt: 2 }}>
          {isEditing ? (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Paciente
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                p: 1.5, 
                border: '1px solid', 
                borderColor: 'divider', 
                borderRadius: 1, 
                bgcolor: 'grey.50' 
              }}>
                {selectedPaciente && (
                  <IconButton
                    size="small"
                    onClick={() => setShowPacienteDialog(true)}
                    sx={{ mr: 1 }}
                  >
                    <Visibility />
                  </IconButton>
                )}
                <Typography variant="body2">
                  {selectedPaciente ? `${selectedPaciente.nome} - ${selectedPaciente.documento}` : 'Carregando...'}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Autocomplete
              options={pacientes}
              getOptionLabel={(option) => `${option.nome} - ${option.documento}`}
              value={selectedPaciente}
              onChange={handlePacienteChange}
              loading={pacientesLoading}
              disabled={loading}
              size="small"
              sx={{
                '& .MuiInputBase-root': {
                  padding: '4px 6px'
                },
                '& .MuiInputBase-input': {
                  padding: '4px 0'
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Paciente *"
                  error={!!errors.pacienteId}
                  helperText={errors.pacienteId?.message}
                  size="small"
                  sx={{
                    '& .MuiInputBase-root': {
                      padding: '4px 6px'
                    },
                    '& .MuiInputBase-input': {
                      padding: '4px 0'
                    }
                  }}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: selectedPaciente && (
                      <IconButton
                        size="small"
                        onClick={() => setShowPacienteDialog(true)}
                        sx={{ mr: 0.375 }}
                      >
                        <Visibility />
                      </IconButton>
                    ),
                    endAdornment: (
                      <>
                        {pacientesLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          )}

          {isEditing ? (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Modalidade DICOM
              </Typography>
              <Box sx={{ 
                p: 1.5, 
                border: '1px solid', 
                borderColor: 'divider', 
                borderRadius: 1, 
                bgcolor: 'grey.50' 
              }}>
                <Typography variant="body2">
                  {watch('modalidade') ? `${watch('modalidade')} - ${ModalidadeDicomLabels[watch('modalidade') as ModalidadeDicom]}` : 'Carregando...'}
                </Typography>
              </Box>
            </Box>
          ) : (
            <FormControl fullWidth error={!!errors.modalidade} size="small"
              sx={{
                '& .MuiInputBase-root': {
                  padding: '4px 6px'
                },
                '& .MuiSelect-select': {
                  padding: '4px 0'
                }
              }}
            >
              <InputLabel>Modalidade DICOM *</InputLabel>
              <Select
                {...register('modalidade')}
                label="Modalidade DICOM *"
                disabled={loading}
                size="small"
              >
                {Object.values(ModalidadeDicom).map((modalidade) => (
                  <MenuItem key={modalidade} value={modalidade}>
                    {modalidade} - {ModalidadeDicomLabels[modalidade]}
                  </MenuItem>
                ))}
              </Select>
              {errors.modalidade && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                  {errors.modalidade.message}
                </Typography>
              )}
            </FormControl>
          )}

          <TextField
            {...register('dataExame')}
            fullWidth
            label="Data do Exame *"
            type="date"
            InputLabelProps={{ shrink: true }}
            error={!!errors.dataExame}
            helperText={errors.dataExame?.message}
            disabled={loading}
            size="small"
            sx={{
              '& .MuiInputBase-root': {
                padding: '4px 6px'
              },
              '& .MuiInputBase-input': {
                padding: '4px 0'
              }
            }}
          />

          <TextField
            {...register('descricao')}
            fullWidth
            label="Laudo"
            placeholder="Digite o laudo do exame..."
            error={!!errors.descricao}
            helperText={errors.descricao?.message}
            disabled={loading}
            multiline
            rows={4}
            sx={{
              '& .MuiInputBase-root': {
                padding: '4px 6px'
              },
              '& .MuiInputBase-input': {
                padding: '4px 0'
              }
            }}
            size="small"
          />



          <Box display="flex" gap={2} justifyContent="flex-end" mt={1}>
            {isEditing && onDelete && initialData && (
              <Button
                variant="outlined"
                color="error"
                onClick={() => onDelete(initialData.id)}
                disabled={loading}
                size="small"
                sx={{ height: '32px', padding: '3px 12px' }}
              >
                Excluir
              </Button>
            )}
            
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <Save />}
              disabled={loading}
              size="small"
              sx={{ height: '32px', padding: '3px 12px' }}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
            
            <Button
              variant="outlined"
              onClick={onCancel || (() => navigate('/exames'))}
              disabled={loading}
              size="small"
              sx={{ height: '32px', padding: '3px 12px' }}
            >
              Fechar
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Dialog de informações do paciente */}
      <Dialog 
        open={showPacienteDialog} 
        onClose={() => setShowPacienteDialog(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            width: { xs: '95vw', sm: '600px' },
            maxWidth: '600px',
            margin: { xs: 1, sm: 3 }
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          Informações do Paciente
        </DialogTitle>
        <DialogContent sx={{ pt: 1.625, px: 1.5, pb: 1 }}>
          {selectedPaciente && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1, sm: 1.2 }, mt: 2.25 }}>
              <TextField
                fullWidth
                label="Nome"
                value={selectedPaciente.nome}
                InputProps={{ readOnly: true }}
                size="small"
                sx={{
                  '& .MuiInputBase-root': {
                    padding: '4px 6px'
                  },
                  '& .MuiInputBase-input': {
                    padding: '4px 0'
                  }
                }}
              />
              
              <TextField
                fullWidth
                label="CPF"
                value={selectedPaciente.documento}
                InputProps={{ readOnly: true }}
                size="small"
                sx={{
                  '& .MuiInputBase-root': {
                    padding: '4px 6px'
                  },
                  '& .MuiInputBase-input': {
                    padding: '4px 0'
                  }
                }}
              />
              
              <TextField
                fullWidth
                label="Data de Nascimento"
                value={new Date(selectedPaciente.dataNascimento).toLocaleDateString('pt-BR')}
                InputProps={{ readOnly: true }}
                size="small"
                sx={{
                  '& .MuiInputBase-root': {
                    padding: '4px 6px'
                  },
                  '& .MuiInputBase-input': {
                    padding: '4px 0'
                  }
                }}
              />
              
              <TextField
                fullWidth
                label="Telefone"
                value={selectedPaciente.telefone || '-'}
                InputProps={{ readOnly: true }}
                size="small"
                sx={{
                  '& .MuiInputBase-root': {
                    padding: '4px 6px'
                  },
                  '& .MuiInputBase-input': {
                    padding: '4px 0'
                  }
                }}
              />
              
              {selectedPaciente.email && (
                <TextField
                  fullWidth
                  label="E-mail"
                  value={selectedPaciente.email}
                  InputProps={{ readOnly: true }}
                  size="small"
                  sx={{
                    '& .MuiInputBase-root': {
                      padding: '4px 6px'
                    },
                    '& .MuiInputBase-input': {
                      padding: '4px 0'
                    }
                  }}
                />
              )}
              
              {selectedPaciente.endereco && (
                <TextField
                  fullWidth
                  label="Endereço"
                  value={selectedPaciente.endereco}
                  InputProps={{ readOnly: true }}
                  size="small"
                  multiline
                  rows={2}
                  sx={{
                    '& .MuiInputBase-root': {
                      padding: '4px 6px'
                    },
                    '& .MuiInputBase-input': {
                      padding: '4px 0'
                    }
                  }}
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 1.5, gap: 1, justifyContent: 'flex-end' }}>
          <Button 
            onClick={() => setShowPacienteDialog(false)}
            variant="outlined"
            sx={{ padding: '3px 12px' }}
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>


    </>
  );
};

export default ExameForm;