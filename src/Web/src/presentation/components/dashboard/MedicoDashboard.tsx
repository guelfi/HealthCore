import React from 'react';
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Skeleton,
  Typography,
} from '@mui/material';
import {
  Assignment,
  MedicalServices,
  People,
  Refresh,
  TrendingDown,
  TrendingFlat,
  TrendingUp,
} from '@mui/icons-material';
import { useAuthStore } from '../../../application/stores/authStore';
import { useMetrics } from '../../hooks/useMetrics';
import DashboardScrollIndicators from '../../../components/ui/Navigation/DashboardScrollIndicators';

type TrendKind = 'up' | 'down' | 'flat';

interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
  shadowColor: string;
}

const toNumber = (value: number | string | undefined): number => {
  if (typeof value === 'number') return value;
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getTrend = (current: number, previous: number): TrendKind => {
  if (current > previous) return 'up';
  if (current < previous) return 'down';
  return 'flat';
};

const MetricCardSkeleton = () => (
  <Card sx={{ minHeight: { xs: 118, md: 112 }, borderRadius: 3 }}>
    <CardContent sx={{ p: { xs: 1.5, md: 2 }, height: '100%' }}>
      <Skeleton variant="text" width="65%" height={16} />
      <Skeleton variant="text" width="35%" height={40} sx={{ my: 0.5 }} />
      <Skeleton variant="text" width="75%" height={14} />
    </CardContent>
  </Card>
);

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  gradient,
  shadowColor,
}) => (
  <Card
    sx={{
      minHeight: { xs: 118, md: 112 },
      background: gradient,
      color: '#1f2937',
      boxShadow: `0 4px 18px ${shadowColor}`,
      borderRadius: 3,
      transition: 'all 0.25s ease-in-out',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: `0 8px 26px ${shadowColor}`,
      },
    }}
  >
    <CardContent
      sx={{
        p: { xs: 1.5, sm: 2 },
        height: '100%',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          alignItems: 'center',
          gap: { xs: 1, md: 1.5 },
          width: '100%',
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            color="rgba(31,41,55,0.72)"
            variant="caption"
            fontWeight={600}
            sx={{
              display: 'block',
              fontSize: { xs: '0.74rem', sm: '0.78rem' },
              lineHeight: 1.2,
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="h3"
            component="div"
            fontWeight="bold"
            sx={{
              lineHeight: 1,
              my: 0.4,
              fontSize: { xs: '1.8rem', sm: '2.1rem', lg: '2.25rem' },
            }}
          >
            {value}
          </Typography>
          <Typography
            variant="caption"
            color="rgba(31,41,55,0.78)"
            sx={{
              display: 'block',
              fontSize: { xs: '0.72rem', sm: '0.74rem' },
              lineHeight: 1.25,
            }}
          >
            {subtitle}
          </Typography>
        </Box>
        <Avatar
          sx={{
            bgcolor: 'rgba(255,255,255,0.68)',
            width: { xs: 44, sm: 48 },
            height: { xs: 44, sm: 48 },
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.82)',
            '& svg': { fontSize: { xs: 23, sm: 25 }, color: '#334155' },
          }}
        >
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const MedicoDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { metrics, isLoading, isInitialLoading, error, refreshMetrics } = useMetrics();

  const calcularExamesEsteMes = (): number => {
    if (!metrics) return 0;
    const agora = new Date();
    const mesAtual = agora.toLocaleDateString('pt-BR', { month: 'long' });
    const examesMes = metrics.crescimento.exames.find(
      item => item.mes.toLowerCase() === mesAtual.toLowerCase()
    );
    return examesMes ? toNumber(examesMes.total) : Math.floor(metrics.exames.totalExames * 0.4);
  };

  const getMesAtual = (): string =>
    new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const displayName = user?.displayName || user?.username || 'médico';

  if (error && !metrics) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 3 }}>
          <Typography variant="h4" component="h1">
            Dashboard Médico
          </Typography>
        </Box>
        <Alert severity="error" action={<Refresh sx={{ cursor: 'pointer' }} onClick={refreshMetrics} />}>
          {error} - Clique no ícone para tentar novamente
        </Alert>
      </Box>
    );
  }

  if (isInitialLoading) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 3 }}>
          <Typography variant="h4" component="h1">
            Dashboard Médico
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
            Carregando suas métricas...
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
              gap: { xs: 1.5, md: 2 },
              width: '100%',
              maxWidth: 1040,
            }}
          >
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </Box>
        </Box>
      </Box>
    );
  }

  if (!metrics) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  const growthRows = metrics.crescimento.exames.map((item, index) => {
    const exames = toNumber(item.total);
    const pacientes = toNumber(metrics.crescimento.pacientes[index]?.total);
    const previous = toNumber(metrics.crescimento.exames[index - 1]?.total);
    const trend = index > 0 ? getTrend(exames, previous) : 'flat';

    return { mes: item.mes, pacientes, exames, trend };
  });

  const activities = [
    { label: 'Exame CT realizado', time: '2h atrás', color: 'success.main' },
    { label: 'Novo paciente cadastrado', time: 'Hoje', color: 'info.main' },
    { label: 'Exame MR agendado', time: 'Ontem', color: 'primary.main' },
    { label: 'Relatório enviado', time: '2 dias', color: 'text.secondary' },
    { label: 'Consulta realizada', time: '3 dias', color: 'text.secondary' },
  ];

  const trendIcon = (trend: TrendKind) => {
    if (trend === 'up') return <TrendingUp fontSize="small" color="success" />;
    if (trend === 'down') return <TrendingDown fontSize="small" color="error" />;
    return <TrendingFlat fontSize="small" color="warning" />;
  };

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Typography variant="h4" component="h1">
          Dashboard Médico
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
          Bem-vindo, {displayName}! Aqui está um resumo da sua atividade.
        </Typography>
        {isLoading && <CircularProgress size={20} sx={{ ml: 2 }} />}
      </Box>

      {error && metrics && (
        <Alert severity="warning" sx={{ mb: 2 }} action={<Refresh sx={{ cursor: 'pointer' }} onClick={refreshMetrics} />}>
          Erro ao atualizar: {error} - Exibindo dados em cache
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
            gap: { xs: 1.5, md: 2 },
            width: '100%',
            maxWidth: 1040,
          }}
        >
          <MetricCard
            title="Meus Pacientes"
            value={metrics.pacientes.totalPacientes}
            subtitle="Sob meus cuidados"
            icon={<People />}
            gradient="linear-gradient(135deg, #c7d2fe 0%, #ddd6fe 100%)"
            shadowColor="rgba(102, 126, 234, 0.28)"
          />
          <MetricCard
            title="Total de Exames"
            value={metrics.exames.totalExames}
            subtitle="Realizados por mim"
            icon={<Assignment />}
            gradient="linear-gradient(135deg, #bae6fd 0%, #cffafe 100%)"
            shadowColor="rgba(79, 172, 254, 0.28)"
          />
          <MetricCard
            title="Exames Este Mês"
            value={calcularExamesEsteMes()}
            subtitle={getMesAtual()}
            icon={<TrendingUp />}
            gradient="linear-gradient(135deg, #fed7aa 0%, #fef3c7 100%)"
            shadowColor="rgba(245, 158, 11, 0.24)"
          />
          <MetricCard
            title="Total Especialidades"
            value={metrics.totalEspecialidades}
            subtitle="Disponíveis no sistema"
            icon={<MedicalServices />}
            gradient="linear-gradient(135deg, #ccfbf1 0%, #fce7f3 100%)"
            shadowColor="rgba(20, 184, 166, 0.22)"
          />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' },
            gap: { xs: 1.5, md: 2.5 },
            width: '100%',
            maxWidth: 1040,
          }}
        >
          <Card
            sx={{
              gridColumn: { xs: 'span 1', md: 'span 2' },
              minHeight: { xs: 300, md: 268 },
              boxShadow: '0 3px 15px rgba(0,0,0,0.1)',
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 2.5 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom fontWeight="bold" color="primary.main" sx={{ fontSize: '1rem', mb: 1.5 }}>
                Exames
              </Typography>
              <Box sx={{ display: 'grid', gap: 0.6 }}>
                {growthRows.map(row => (
                  <Box
                    key={row.mes}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: '1fr auto auto' },
                      alignItems: 'center',
                      gap: { xs: 0.35, sm: 1.25 },
                      p: { xs: 0.7, md: 0.75 },
                      borderRadius: 2,
                      bgcolor: 'rgba(239, 246, 255, 0.9)',
                    }}
                  >
                    <Typography variant="body2" fontWeight={700} color="text.secondary" sx={{ fontSize: { xs: '0.82rem', md: '0.86rem' } }}>
                      {row.mes}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, minWidth: { md: 112 } }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                        Pacientes:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold" color="success.main" sx={{ fontSize: '0.82rem', fontFamily: 'monospace' }}>
                        {row.pacientes}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, minWidth: { md: 96 } }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                        Exames:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold" color="info.main" sx={{ fontSize: '0.82rem', fontFamily: 'monospace' }}>
                        {row.exames}
                      </Typography>
                      {trendIcon(row.trend)}
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          <Card
            sx={{
              gridColumn: { xs: 'span 1', md: 'span 2' },
              minHeight: { xs: 300, md: 268 },
              boxShadow: '0 3px 15px rgba(0,0,0,0.1)',
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 2.5 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom fontWeight="bold" color="secondary.main" sx={{ fontSize: '1rem', mb: 1.5 }}>
                Atividades
              </Typography>
              <Box sx={{ display: 'grid', gap: 0.7 }}>
                {activities.map(activity => (
                  <Box
                    key={activity.label}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(0, 1fr) auto',
                      alignItems: 'center',
                      gap: 1,
                      p: { xs: 0.7, md: 0.75 },
                      borderRadius: 2,
                      bgcolor: 'rgba(248, 250, 252, 0.95)',
                    }}
                  >
                    <Typography variant="body2" fontWeight={500} sx={{ fontSize: { xs: '0.82rem', md: '0.86rem' }, lineHeight: 1.25 }}>
                      {activity.label}
                    </Typography>
                    <Typography variant="caption" color={activity.color} fontWeight={700} sx={{ fontSize: '0.74rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {activity.time}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <DashboardScrollIndicators />
    </Box>
  );
};

export default MedicoDashboard;