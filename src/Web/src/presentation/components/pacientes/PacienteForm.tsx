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
  Grid,
  Alert,
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { CreatePacienteDto } from '../../../domain/entities/Paciente';
import { useUIStore } from '../../../application/stores/uiStore';

const pacienteSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF deve estar no formato 000.000.000-00'),
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
  
  const [loading, setLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<PacienteFormData>({
    resolver: zodResolver(pacienteSchema),
  });

  React.useEffect(() => {
    if (isEditing) {
      // Mock data for editing - in real app, would fetch from API
      setValue('nome', 'João Silva');
      setValue('cpf', '123.456.789-01');
      setValue('dataNascimento', '1985-05-15');
      setValue('telefone', '(11) 99999-1111');
      setValue('email', 'joao.silva@email.com');
      setValue('endereco', 'Rua das Flores, 123 - São Paulo/SP');
    }
  }, [isEditing, setValue]);

  const onSubmit = async (data: PacienteFormData) => {
    setLoading(true);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const action = isEditing ? 'atualizado' : 'cadastrado';
      addNotification(`Paciente ${action} com sucesso!`, 'success');
      navigate('/pacientes');
    } catch (error) {
      addNotification('Erro ao salvar paciente', 'error');
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
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/pacientes')}
          variant="outlined"
        >
          Voltar
        </Button>
        <Box>
          <Typography variant="h4" component="h1">
            {isEditing ? 'Editar Paciente' : 'Novo Paciente'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isEditing ? 'Atualize as informações do paciente' : 'Cadastre um novo paciente no sistema'}
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
              <TextField
                {...register('nome')}
                fullWidth
                label="Nome Completo *"
                error={!!errors.nome}
                helperText={errors.nome?.message}
                disabled={loading}
              />

              <TextField
                {...register('cpf')}
                fullWidth
                label="CPF *"
                placeholder="000.000.000-00"
                error={!!errors.cpf}
                helperText={errors.cpf?.message}
                disabled={loading}
                onChange={(e) => {
                  const formatted = formatCPF(e.target.value);
                  setValue('cpf', formatted);
                }}
              />

              <TextField
                {...register('dataNascimento')}
                fullWidth
                label="Data de Nascimento *"
                type="date"
                InputLabelProps={{ shrink: true }}
                error={!!errors.dataNascimento}
                helperText={errors.dataNascimento?.message}
                disabled={loading}
              />

              <TextField
                {...register('telefone')}
                fullWidth
                label="Telefone"
                placeholder="(11) 99999-9999"
                error={!!errors.telefone}
                helperText={errors.telefone?.message}
                disabled={loading}
                onChange={(e) => {
                  const formatted = formatPhone(e.target.value);
                  setValue('telefone', formatted);
                }}
              />

              <TextField
                {...register('email')}
                fullWidth
                label="Email"
                type="email"
                placeholder="paciente@email.com"
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={loading}
              />

              <TextField
                {...register('endereco')}
                fullWidth
                label="Endereço"
                placeholder="Rua, número, bairro - Cidade/Estado"
                error={!!errors.endereco}
                helperText={errors.endereco?.message}
                disabled={loading}
                multiline
                rows={2}
              />

              <Box display="flex" gap={2} justifyContent="flex-end" mt={2}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/pacientes')}
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

export default PacienteForm;