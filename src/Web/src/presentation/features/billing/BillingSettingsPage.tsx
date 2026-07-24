import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { CheckCircle, PauseCircle, Refresh, Save } from '@mui/icons-material';
import { standardCardStyles, standardCardContentStyles } from '../../styles/cardStyles';
import {
  BillingCycle,
  BillingService,
  type MedicoSubscription,
  SubscriptionStatus,
  billingCycleLabels,
  billingStatusLabels,
} from '../../../application/services/BillingService';

const STORAGE_KEY = 'healthcore-billing-template-settings';

interface BillingTemplateSettings {
  emailSubject: string;
  emailBody: string;
  whatsappBody: string;
}

const defaultSettings: BillingTemplateSettings = {
  emailSubject: 'HealthCore - aviso de pagamento em atraso',
  emailBody:
    'Olá, {{medicoNome}}. Identificamos que a mensalidade HealthCore vencida em {{dataVencimento}} ainda não foi regularizada. Envie o comprovante de pagamento por e-mail ou WhatsApp para liberação administrativa.',
  whatsappBody:
    'Olá, {{medicoNome}}. Sua mensalidade HealthCore vencida em {{dataVencimento}} está pendente. Após o pagamento via PIX, envie o comprovante para reativação manual pelo administrador.',
};

const formatDate = (value?: string | null) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('pt-BR');
};

const statusColor = (status: SubscriptionStatus): 'success' | 'info' | 'warning' | 'error' => {
  if (status === SubscriptionStatus.Active) return 'success';
  if (status === SubscriptionStatus.Trial) return 'info';
  if (status === SubscriptionStatus.Overdue) return 'warning';
  return 'error';
};

const BillingSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [settings, setSettings] = useState<BillingTemplateSettings>(defaultSettings);
  const [subscriptions, setSubscriptions] = useState<MedicoSubscription[]>([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await BillingService.listSubscriptions();
      setSubscriptions(data);
    } catch (loadError: unknown) {
      const message = loadError instanceof Error ? loadError.message : 'Erro ao carregar assinaturas.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setSettings({ ...defaultSettings, ...JSON.parse(stored) });
    }
    void loadSubscriptions();
  }, []);

  const handleChange = (field: keyof BillingTemplateSettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
  };

  const handleRelease = async (subscription: MedicoSubscription, cycle: BillingCycle) => {
    try {
      setActionLoading(subscription.medicoId + cycle);
      await BillingService.releasePayment(
        subscription.medicoId,
        cycle,
        cycle === BillingCycle.Annual
          ? 'Pagamento anual liberado manualmente pelo administrador.'
          : 'Pagamento mensal liberado manualmente pelo administrador.'
      );
      await loadSubscriptions();
    } catch (releaseError: unknown) {
      const message = releaseError instanceof Error ? releaseError.message : 'Erro ao liberar pagamento.';
      setError(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async (subscription: MedicoSubscription) => {
    try {
      setActionLoading(subscription.medicoId + 'suspend');
      await BillingService.suspend(subscription.medicoId, 'Suspensão manual pelo administrador.');
      await loadSubscriptions();
    } catch (suspendError: unknown) {
      const message = suspendError instanceof Error ? suspendError.message : 'Erro ao suspender assinatura.';
      setError(message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 3 }}>
        <Typography variant="h4" component="h1">
          Cobrança e Templates
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ display: { xs: 'none', md: 'block' } }}
        >
          Assinaturas, liberação manual e mensagens planejadas
        </Typography>
      </Box>

      <Stack spacing={3}>
        <Card sx={{ ...standardCardStyles, maxWidth: '100%' }}>
          <CardContent sx={standardCardContentStyles}>
            <Stack spacing={2.25}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                <Box>
                  <Typography variant="h6" sx={{ mb: 0.5 }}>
                    Assinaturas dos médicos
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    PIX é controlado manualmente nesta versão. Após receber comprovante, libere mensal ou anual.
                  </Typography>
                </Box>
                <Button startIcon={<Refresh />} onClick={loadSubscriptions} disabled={loading} sx={{ textTransform: 'none' }}>
                  Atualizar
                </Button>
              </Box>

              {error && <Alert severity="error">{error}</Alert>}
              {loading && <CircularProgress size={28} />}

              <Box sx={{ display: 'grid', gap: 1.5 }}>
                {subscriptions.map(subscription => (
                  <Box
                    key={subscription.id}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: '1.3fr 0.7fr 0.8fr 0.8fr auto' },
                      gap: 1.5,
                      alignItems: 'center',
                      p: 1.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      bgcolor: 'background.paper',
                    }}
                  >
                    <Box>
                      <Typography fontWeight={700}>{subscription.medicoNome}</Typography>
                      <Typography variant="body2" color="text.secondary">{subscription.username}</Typography>
                    </Box>
                    <Chip
                      label={billingStatusLabels[subscription.status]}
                      color={statusColor(subscription.status)}
                      variant="outlined"
                      size="small"
                    />
                    <Typography variant="body2">
                      {billingCycleLabels[subscription.billingCycle]}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Venc.: {formatDate(subscription.nextDueDate || subscription.trialEndsAt)}
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<CheckCircle />}
                        disabled={!!actionLoading}
                        onClick={() => handleRelease(subscription, BillingCycle.Monthly)}
                      >
                        Mensal
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<CheckCircle />}
                        disabled={!!actionLoading}
                        onClick={() => handleRelease(subscription, BillingCycle.Annual)}
                      >
                        Anual
                      </Button>
                      <Button
                        size="small"
                        color="warning"
                        variant="outlined"
                        startIcon={<PauseCircle />}
                        disabled={!!actionLoading}
                        onClick={() => handleSuspend(subscription)}
                      >
                        Suspender
                      </Button>
                    </Stack>
                  </Box>
                ))}

                {!loading && subscriptions.length === 0 && (
                  <Alert severity="info">Nenhuma assinatura encontrada.</Alert>
                )}
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ ...standardCardStyles, maxWidth: 960 }}>
          <CardContent sx={standardCardContentStyles}>
            <Stack spacing={2.5}>
              <Alert severity="info">
                Provedores de PIX, e-mail e Evolution API ficam planejados. Os templates abaixo preparam o conteúdo para a integração futura.
              </Alert>

              {saved && <Alert severity="success">Templates salvos localmente para validação da interface.</Alert>}

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                <TextField label="Plano mensal" value="R$49,00" disabled />
                <TextField label="Plano anual" value="R$490,00" disabled />
                <TextField label="Teste gratuito" value="30 dias" disabled />
              </Box>

              <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
                <Tab label="E-mail" />
                <Tab label="WhatsApp" />
              </Tabs>

              {activeTab === 0 && (
                <Stack spacing={2}>
                  <TextField
                    label="Assunto do e-mail"
                    value={settings.emailSubject}
                    onChange={event => handleChange('emailSubject', event.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Template do e-mail de atraso"
                    value={settings.emailBody}
                    onChange={event => handleChange('emailBody', event.target.value)}
                    fullWidth
                    multiline
                    minRows={8}
                  />
                </Stack>
              )}

              {activeTab === 1 && (
                <TextField
                  label="Template da mensagem WhatsApp"
                  value={settings.whatsappBody}
                  onChange={event => handleChange('whatsappBody', event.target.value)}
                  fullWidth
                  multiline
                  minRows={8}
                  helperText="Preparado para uso futuro via Evolution API."
                />
              )}

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" startIcon={<Save />} onClick={handleSave} sx={{ textTransform: 'none', fontWeight: 700 }}>
                  Salvar templates
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default BillingSettingsPage;