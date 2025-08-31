import React from 'react';
import {
  Typography,
  Card,
  CardContent,
  Box,
  Avatar,
  CircularProgress,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  People,
  Assignment,
  TrendingUp,
  Refresh,
} from '@mui/icons-material';
import { useAuthStore } from '../../../application/stores/authStore';
import { useMetrics } from '../../hooks/useMetrics';

const MedicoDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { metrics, isLoading, isInitialLoading, error, refreshMetrics } = useMetrics();

  // Component para renderizar skeleton dos cards
  const MetricCardSkeleton = () => (
    <Card sx={{ flex: 1, height: 110, borderRadius: 3 }}>
      <CardContent sx={{ p: 2, height: '100%' }}>
        <Skeleton variant="text" width="60%" height={16} />
        <Skeleton variant="text" width="40%" height={40} sx={{ my: 0.5 }} />
        <Skeleton variant="text" width="70%" height={14} />
      </CardContent>
    </Card>
  );

  // Calcular exames do mês atual
  const calcularExamesEsteMes = (): number => {
    if (!metrics) return 0;
    const agora = new Date();
    const mesAtual = agora.toLocaleDateString('pt-BR', { month: 'long' });
    const examesMes = metrics.crescimento.exames.find(item => 
      item.mes.toLowerCase() === mesAtual.toLowerCase()
    );
    return examesMes?.total || Math.floor(metrics.exames.totalExames * 0.4);
  };

  // Obter nome do mês atual
  const getMesAtual = (): string => {
    return new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  // Se há erro e não há dados em cache
  if (error && !metrics) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 3 }}>
          <Typography variant="h4" component="h1">
            Dashboard Médico
          </Typography>
        </Box>
        <Alert 
          severity="error" 
          action={
            <Refresh 
              sx={{ cursor: 'pointer' }} 
              onClick={refreshMetrics}
            />
          }
        >
          {error} - Clique no ícone para tentar novamente
        </Alert>
      </Box>
    );
  }

  // Loading inicial
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
        
        {/* Skeleton dos cards superiores */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, width: '90%' }}>
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </Box>
        </Box>
        
        {/* Skeleton dos cards inferiores */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, width: '90%' }}>
            <Card sx={{ flex: 1, height: 230, borderRadius: 3 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Skeleton variant="text" width="50%" height={24} sx={{ mb: 2 }} />
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 1.5, borderRadius: 2 }} />
                ))}
              </CardContent>
            </Card>
            <Card sx={{ flex: 1, height: 230, borderRadius: 3 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Skeleton variant="text" width="50%" height={24} sx={{ mb: 2 }} />
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} variant="rectangular" height={40} sx={{ mb: 1.5, borderRadius: 2 }} />
                ))}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    );
  }

  // Se não há métricas ainda
  if (!metrics) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 3 }}>
        <Typography variant="h4" component="h1">
          Dashboard Médico
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
          Bem-vindo, Dr. {user?.username}! Aqui está um resumo da sua atividade.
        </Typography>
        {isLoading && (
          <CircularProgress size={20} sx={{ ml: 2 }} />
        )}
      </Box>
      
      {/* Alerta de erro (se há erro mas dados em cache) */}
      {error && metrics && (
        <Alert 
          severity="warning" 
          sx={{ mb: 2 }}
          action={
            <Refresh 
              sx={{ cursor: 'pointer' }} 
              onClick={refreshMetrics}
            />
          }
        >
          Erro ao atualizar: {error} - Exibindo dados em cache
        </Alert>
      )}

      {/* Cards Superiores - Totais do Médico */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, width: '90%' }}>
          <Card
            sx={{
              flex: 1,
              height: 110,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              boxShadow: '0 4px 18px rgba(102, 126, 234, 0.3)',
              borderRadius: 3,
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 28px rgba(102, 126, 234, 0.4)',
              }
            }}
          >
            <CardContent sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography color="rgba(255,255,255,0.8)" variant="caption" fontWeight={500} sx={{ fontSize: '0.8rem', display: 'block' }}>
                    Meus Pacientes
                  </Typography>
                  <Typography variant="h3" component="div" fontWeight="bold" sx={{ lineHeight: 1.1, my: 0.3, fontSize: { xs: '1.8rem', sm: '2.5rem' } }}>
                    {metrics.pacientes.totalPacientes}
                  </Typography>
                  <Typography variant="caption" color="rgba(255,255,255,0.9)" sx={{ fontSize: '0.75rem', display: 'block' }}>
                    Sob meus cuidados
                  </Typography>
                </Box>
                <Avatar sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  width: 50,
                  height: 50,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  ml: 1
                }}>
                  <People sx={{ fontSize: 26, color: 'white' }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>

          <Card
            sx={{
              flex: 1,
              height: 110,
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              boxShadow: '0 4px 18px rgba(79, 172, 254, 0.3)',
              borderRadius: 3,
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 28px rgba(79, 172, 254, 0.4)',
              }
            }}
          >
            <CardContent sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography color="rgba(255,255,255,0.8)" variant="caption" fontWeight={500} sx={{ fontSize: '0.8rem', display: 'block' }}>
                    Total de Exames
                  </Typography>
                  <Typography variant="h3" component="div" fontWeight="bold" sx={{ lineHeight: 1.1, my: 0.3, fontSize: { xs: '1.8rem', sm: '2.5rem' } }}>
                    {metrics.exames.totalExames}
                  </Typography>
                  <Typography variant="caption" color="rgba(255,255,255,0.9)" sx={{ fontSize: '0.75rem', display: 'block' }}>
                    Realizados por mim
                  </Typography>
                </Box>
                <Avatar sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  width: 50,
                  height: 50,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  ml: 1
                }}>
                  <Assignment sx={{ fontSize: 26, color: 'white' }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>

          <Card
            sx={{
              flex: 1,
              height: 110,
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              color: 'white',
              boxShadow: '0 4px 18px rgba(250, 112, 154, 0.3)',
              borderRadius: 3,
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 28px rgba(250, 112, 154, 0.4)',
              }
            }}
          >
            <CardContent sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography color="rgba(255,255,255,0.8)" variant="caption" fontWeight={500} sx={{ fontSize: '0.8rem', display: 'block' }}>
                    Exames Este Mês
                  </Typography>
                  <Typography variant="h3" component="div" fontWeight="bold" sx={{ lineHeight: 1.1, my: 0.3, fontSize: { xs: '1.8rem', sm: '2.5rem' } }}>
                    {calcularExamesEsteMes()}
                  </Typography>
                  <Typography variant="caption" color="rgba(255,255,255,0.9)" sx={{ fontSize: '0.75rem', display: 'block' }}>
                    {getMesAtual()}
                  </Typography>
                </Box>
                <Avatar sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  width: 50,
                  height: 50,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  ml: 1
                }}>
                  <TrendingUp sx={{ fontSize: 26, color: 'white' }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Cards Inferiores - Estatísticas do Médico */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, width: '90%' }}>
          <Card sx={{
            flex: 1,
            height: 230,
            boxShadow: '0 3px 15px rgba(0,0,0,0.1)',
            borderRadius: 3,
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-3px)',
              boxShadow: '0 6px 25px rgba(0,0,0,0.15)',
            }
          }}>
            <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom fontWeight="bold" color="primary.main" sx={{ fontSize: '1rem', mb: 2 }}>
                Exames
              </Typography>
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                {metrics.crescimento.exames.map((item, index) => (
                  <Box key={item.mes} display="flex" justifyContent="space-between" alignItems="center"
                    sx={{
                      mb: 0.2,
                      p: 0.6,
                      borderRadius: 2,
                      bgcolor: 'grey.50',
                      transition: 'all 0.2s ease',
                      '&:hover': { bgcolor: 'primary.50' }
                    }}>
                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>{item.mes}</Typography>
                    <Box display="flex" gap={2}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Pacientes:</Typography>
                        <Typography variant="body2" fontWeight="bold" color="success.main" sx={{ fontSize: '0.8rem' }}>
                          {metrics.crescimento.pacientes[index]?.total || 0}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Exames:</Typography>
                        <Typography variant="body2" fontWeight="bold" color="info.main" sx={{ fontSize: '0.8rem' }}>{item.total}</Typography>
                        {index > 0 && typeof item.total === 'number' && typeof (metrics.crescimento.exames[index - 1]?.total) === 'number' && (
                          <Typography
                            variant="body2"
                            color={item.total > (metrics.crescimento.exames[index - 1]?.total || 0) ? 'success.main' : 'text.secondary'}
                            sx={{ fontSize: '1em' }}
                          >
                            {item.total > (metrics.crescimento.exames[index - 1]?.total || 0) ? '↗' : '→'}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          <Card sx={{
            flex: 1,
            height: 230,
            boxShadow: '0 3px 15px rgba(0,0,0,0.1)',
            borderRadius: 3,
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-3px)',
              boxShadow: '0 6px 25px rgba(0,0,0,0.15)',
            }
          }}>
            <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom fontWeight="bold" color="secondary.main" sx={{ fontSize: '1rem', mb: 2 }}>
                Atividades
              </Typography>
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center"
                  sx={{
                    mb: 0.2,
                    p: 0.6,
                    borderRadius: 2,
                    bgcolor: 'grey.50',
                    transition: 'all 0.2s ease',
                    '&:hover': { bgcolor: 'secondary.50' }
                  }}>
                  <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.85rem' }}>Exame CT realizado</Typography>
                  <Typography variant="caption" color="success.main" fontWeight={600} sx={{ fontSize: '0.75rem' }}>2h atrás</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center"
                  sx={{
                    mb: 0.2,
                    p: 0.6,
                    borderRadius: 2,
                    bgcolor: 'grey.50',
                    transition: 'all 0.2s ease',
                    '&:hover': { bgcolor: 'secondary.50' }
                  }}>
                  <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.85rem' }}>Novo paciente cadastrado</Typography>
                  <Typography variant="caption" color="info.main" fontWeight={600} sx={{ fontSize: '0.75rem' }}>Hoje</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center"
                  sx={{
                    mb: 0.2,
                    p: 0.6,
                    borderRadius: 2,
                    bgcolor: 'grey.50',
                    transition: 'all 0.2s ease',
                    '&:hover': { bgcolor: 'secondary.50' }
                  }}>
                  <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.85rem' }}>Exame MR agendado</Typography>
                  <Typography variant="caption" color="primary.main" fontWeight={600} sx={{ fontSize: '0.75rem' }}>Ontem</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center"
                  sx={{
                    mb: 0.2,
                    p: 0.6,
                    borderRadius: 2,
                    bgcolor: 'grey.50',
                    transition: 'all 0.2s ease',
                    '&:hover': { bgcolor: 'secondary.50' }
                  }}>
                  <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.85rem' }}>Relatório enviado</Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.75rem' }}>2 dias</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center"
                  sx={{
                    mb: 0.2,
                    p: 0.6,
                    borderRadius: 2,
                    bgcolor: 'grey.50',
                    transition: 'all 0.2s ease',
                    '&:hover': { bgcolor: 'secondary.50' }
                  }}>
                  <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.85rem' }}>Consulta realizada</Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.75rem' }}>3 dias</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

    </Box>
  );
};

export default MedicoDashboard;