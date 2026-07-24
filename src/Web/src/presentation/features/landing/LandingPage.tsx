import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Login, Send } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../infrastructure/api/client';
import DashboardScrollIndicators from '../../../components/ui/Navigation/DashboardScrollIndicators';

type BillingCycle = 1 | 2;

interface PublicRegistrationForm {
  nome: string;
  documento: string;
  dataNascimento: string;
  crm: string;
  email: string;
  telefone: string;
  especialidade: string;
  username: string;
  password: string;
  billingCycle: BillingCycle;
}

interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

const initialForm: PublicRegistrationForm = {
  nome: '',
  documento: '',
  dataNascimento: '',
  crm: '',
  email: '',
  telefone: '',
  especialidade: '',
  username: '',
  password: '',
  billingCycle: 1,
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<PublicRegistrationForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const updateField = <K extends keyof PublicRegistrationForm>(
    field: K,
    value: PublicRegistrationForm[K]
  ) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setSuccess('');
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccess('');
    setError('');

    try {
      setSubmitting(true);
      await apiClient.post('/public/medicos/register', {
        nome: form.nome.trim(),
        documento: form.documento.trim(),
        dataNascimento: form.dataNascimento,
        crm: form.crm.trim(),
        email: form.email.trim(),
        telefone: form.telefone.trim(),
        especialidade: form.especialidade.trim(),
        username: form.username.trim(),
        password: form.password,
        billingCycle: form.billingCycle,
        isActive: true,
      });

      setSuccess('Cadastro criado com teste gratuito de 30 dias. Use o login informado para acessar o HealthCore.');
      setForm(initialForm);
    } catch (registrationError: unknown) {
      const response = registrationError as ErrorResponse;
      setError(response.response?.data?.message || response.message || 'Não foi possível concluir o cadastro.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#f6f9fc', minHeight: '100vh' }}>
      <Box
        sx={{
          minHeight: { xs: '92vh', md: '88vh' },
          display: 'flex',
          alignItems: 'center',
          color: 'white',
          backgroundImage:
            'linear-gradient(90deg, rgba(4, 18, 34, 0.96) 0%, rgba(7, 32, 57, 0.86) 42%, rgba(7, 32, 57, 0.42) 100%), url("https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1800&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
          <Box sx={{ maxWidth: 680 }}>
            <Typography
              variant="h2"
              component="h1"
              sx={{
                color: '#ffffff',
                fontWeight: 800,
                fontSize: { xs: 42, md: 64 },
                mb: 2,
                textShadow: '0 4px 20px rgba(0, 0, 0, 0.58)',
              }}
            >
              HealthCore
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: 'rgba(255,255,255,0.94)',
                lineHeight: 1.5,
                mb: 4,
                textShadow: '0 2px 12px rgba(0, 0, 0, 0.48)',
              }}
            >
              Gestão simples para médicos acompanharem pacientes, exames e histórico clínico em uma plataforma SaaS pronta para evoluir com análise assistida por IA.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="contained"
                size="large"
                onClick={() => document.getElementById('cadastro-medico')?.scrollIntoView({ behavior: 'smooth' })}
                sx={{ textTransform: 'none', fontWeight: 700, px: 3 }}
              >
                Comecar teste de 30 dias
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<Login />}
                onClick={() => navigate('/login')}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 3,
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.72)',
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.12)' },
                }}
              >
                Login medico
              </Button>
            </Stack>
          </Box>
        </Container>
            <DashboardScrollIndicators mobileOnly={false} />
    </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '0.95fr 1.05fr' }, gap: 3 }}>
          <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 2, border: '1px solid #dce7f3' }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              Plano unico
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Um plano mensal fixo para operar pacientes, exames e historico clinico.
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#0f6ec7' }}>
              R$49,00
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              por mes, com vencimento no primeiro dia de cada mes.
            </Typography>
            <Box sx={{ display: 'grid', gap: 1.5 }}>
              <Alert severity="info">Plano anual: R$490,00 em cobrança única, equivalente a 12 meses com 2 meses de desconto.</Alert>
              <Alert severity="success">Teste gratuito de 30 dias para novos médicos.</Alert>
              <Alert severity="warning">Pagamento ágil, rápido e fácil via transferência Pix automático mensalmente ou pagamento único com desconto</Alert>
            </Box>
          </Paper>

          <Paper
            id="cadastro-medico"
            component="form"
            onSubmit={handleSubmit}
            elevation={0}
            sx={{ p: { xs: 3, md: 4 }, borderRadius: 2, border: '1px solid #dce7f3' }}
          >
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              Cadastro para teste
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Crie seu acesso inicial e comece o período gratuito de 30 dias.
            </Typography>
            <Stack spacing={2}>
              {success && <Alert severity="success">{success}</Alert>}
              {error && <Alert severity="error">{error}</Alert>}

              <TextField
                label="Nome completo"
                value={form.nome}
                onChange={event => updateField('nome', event.target.value)}
                required
                fullWidth
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  label="CPF"
                  value={form.documento}
                  onChange={event => updateField('documento', event.target.value)}
                  required
                  fullWidth
                />
                <TextField
                  label="Data de nascimento"
                  type="date"
                  value={form.dataNascimento}
                  onChange={event => updateField('dataNascimento', event.target.value)}
                  required
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  label="CRM"
                  value={form.crm}
                  onChange={event => updateField('crm', event.target.value)}
                  required
                  fullWidth
                />
                <TextField
                  label="Especialidade principal"
                  value={form.especialidade}
                  onChange={event => updateField('especialidade', event.target.value)}
                  fullWidth
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  label="E-mail"
                  type="email"
                  value={form.email}
                  onChange={event => updateField('email', event.target.value)}
                  required
                  fullWidth
                />
                <TextField
                  label="WhatsApp"
                  value={form.telefone}
                  onChange={event => updateField('telefone', event.target.value)}
                  required
                  fullWidth
                />
              </Box>

              <FormControl fullWidth>
                <InputLabel id="billing-cycle-label">Plano desejado</InputLabel>
                <Select
                  labelId="billing-cycle-label"
                  label="Plano desejado"
                  value={form.billingCycle}
                  onChange={event => updateField('billingCycle', Number(event.target.value) as BillingCycle)}
                >
                  <MenuItem value={1}>Mensal - R$49,00 por mes</MenuItem>
                  <MenuItem value={2}>Anual - R$490,00 em cobranca unica</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  label="Usuario de acesso"
                  value={form.username}
                  onChange={event => updateField('username', event.target.value)}
                  required
                  fullWidth
                />
                <TextField
                  label="Senha"
                  type="password"
                  value={form.password}
                  onChange={event => updateField('password', event.target.value)}
                  required
                  fullWidth
                  inputProps={{ minLength: 6 }}
                />
              </Box>

              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<Send />}
                disabled={submitting}
                sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' }, textTransform: 'none', fontWeight: 700 }}
              >
                {submitting ? 'Criando cadastro...' : 'Criar acesso de teste'}
              </Button>
            </Stack>
          </Paper>
        </Box>
      </Container>
          <DashboardScrollIndicators mobileOnly={false} />
    </Box>
  );
};

export default LandingPage;