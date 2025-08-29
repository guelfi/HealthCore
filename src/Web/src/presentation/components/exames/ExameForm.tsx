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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import type { CreateExameDto } from '../../../domain/entities/Exame';
import { ModalidadeDicom, ModalidadeDicomLabels } from '../../../domain/enums/ModalidadeDicom';
import { mockPacientes } from '../../../application/stores/mockData';
import { useUIStore } from '../../../application/stores/uiStore';

const exameSchema = z.object({
  pacienteId: z.string().min(1, 'Paciente é obrigatório'),
  modalidade: z.nativeEnum(ModalidadeDicom, { errorMap: () => ({ message: 'Modalidade é obrigatória' }) }),
  descricao: z.string().optional(),
  dataExame: z.string().min(1, 'Data do exame é obrigatória'),
});

type ExameFormData = z.infer<typeof exameSchema>;

const ExameForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addNotification } = useUIStore();
  const isEditing = Boolean(id);
  
  const [loading, setLoading] = React.useState(false);
  const [selectedPaciente, setSelectedPaciente] = React.useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ExameFormData>({
    resolver: zodResolver(exameSchema),
  });

  const watchedPacienteId = watch('pacienteId');

  React.useEffect(() => {
    if (isEditing) {
      // Mock data for editing - in real app, would fetch from API
      setValue('pacienteId', '1');
      setValue('modalidade', ModalidadeDicom.CT);
      setValue('descricao', 'Tomografia de crânio');
      setValue('dataExame', '2024-02-01');
      setSelectedPaciente(mockPacientes[0]);
    }
  }, [isEditing, setValue]);

  const onSubmit = async (data: ExameFormData) => {
    setLoading(true);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const action = isEditing ? 'atualizado' : 'cadastrado';
      addNotification(`Exame ${action} com sucesso!`, 'success');
      navigate('/exames');
    } catch (error) {
      addNotification('Erro ao salvar exame', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePacienteChange = (event: any, newValue: any) => {
    setSelectedPaciente(newValue);
    setValue('pacienteId', newValue?.id || '');
  };

  const generateIdempotencyKey = () => {
    return `exam-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/exames')}
          variant="outlined"
        >
          Voltar
        </Button>
        <Box>
          <Typography variant="h4" component="h1">
            {isEditing ? 'Editar Exame' : 'Novo Exame'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isEditing ? 'Atualize as informações do exame' : 'Cadastre um novo exame no sistema'}
          </Typography>
        </Box>
      </Box>

      <Card>
        <CardContent>
          <Box 
            component="form" 
            onSubmit={handleSubmit(onSubmit)}
            sx={{ 
              maxWidth: { xs: '100%', sm: '600px' },
              mx: 'auto'
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Autocomplete
                options={mockPacientes}
                getOptionLabel={(option) => `${option.nome} - ${option.documento}`}
                value={selectedPaciente}
                onChange={handlePacienteChange}
                disabled={loading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Paciente *"
                    error={!!errors.pacienteId}
                    helperText={errors.pacienteId?.message}
                  />
                )}
              />

              <FormControl fullWidth error={!!errors.modalidade}>
                <InputLabel>Modalidade DICOM *</InputLabel>
                <Select
                  {...register('modalidade')}
                  label="Modalidade DICOM *"
                  disabled={loading}
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

              <TextField
                {...register('dataExame')}
                fullWidth
                label="Data do Exame *"
                type="date"
                InputLabelProps={{ shrink: true }}
                error={!!errors.dataExame}
                helperText={errors.dataExame?.message}
                disabled={loading}
              />

              <TextField
                {...register('descricao')}
                fullWidth
                label="Descrição"
                placeholder="Descreva o exame realizado..."
                error={!!errors.descricao}
                helperText={errors.descricao?.message}
                disabled={loading}
                multiline
                rows={3}
              />

              {selectedPaciente && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Informações do Paciente
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Nome
                        </Typography>
                        <Typography variant="body1">
                          {selectedPaciente.nome}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          CPF
                        </Typography>
                        <Typography variant="body1">
                          {selectedPaciente.cpf}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Data de Nascimento
                        </Typography>
                        <Typography variant="body1">
                          {new Date(selectedPaciente.dataNascimento).toLocaleDateString('pt-BR')}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Telefone
                        </Typography>
                        <Typography variant="body1">
                          {selectedPaciente.telefone || '-'}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              )}

              <Box display="flex" gap={2} justifyContent="flex-end" mt={2}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/exames')}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </Button>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ExameForm;