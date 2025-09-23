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
  LocalHospital,
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Refresh,
} from '@mui/icons-material';
import { useMetrics } from '../../hooks/useMetrics';
import DashboardScrollIndicators from '../../../components/ui/Navigation/DashboardScrollIndicators';

const AdminDashboard: React.FC = () => {
  const { metrics, isLoading, isInitialLoading, error, refreshMetrics } =
    useMetrics();

  // Função para formatar números com 3 casas, preenchendo com espaços não-quebráveis à esquerda
  const formatNumber = (num: number): string => {
    const numStr = num.toString();
    return numStr.padStart(3, '\u00A0'); // Usando espaço não-quebrável (nbsp)
  };

  // Component para renderizar skeleton dos cards
  const MetricCardSkeleton = () => (
    <Card sx={{ flex: 1, height: 100, borderRadius: 2 }}>
      <CardContent sx={{ p: 1.5, height: '100%' }}>
        <Skeleton variant="text" width="60%" height={16} />
        <Skeleton variant="text" width="40%" height={32} sx={{ my: 0.5 }} />
        <Skeleton variant="text" width="70%" height={14} />
      </CardContent>
    </Card>
  );

  // Se há erro e não há dados em cache
  if (error && !metrics) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 3 }}>
          <Typography variant="h4" component="h1">
            Dashboard Administrativo
          </Typography>
        </Box>
        <Alert
          severity="error"
          action={
            <Refresh sx={{ cursor: 'pointer' }} onClick={refreshMetrics} />
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
            Dashboard Administrativo
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ display: { xs: 'none', md: 'block' } }}
          >
            Carregando métricas do sistema...
          </Typography>
        </Box>

        {/* Skeleton dos cards superiores */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 1.5,
              width: '95%',
            }}
          >
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </Box>
        </Box>

        {/* Skeleton dos cards inferiores */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2,
              width: '95%',
            }}
          >
            <Card sx={{ flex: 1, height: 280, borderRadius: 3 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Skeleton
                  variant="text"
                  width="50%"
                  height={24}
                  sx={{ mb: 2 }}
                />
                {[...Array(6)].map((_, i) => (
                  <Skeleton
                    key={i}
                    variant="rectangular"
                    height={40}
                    sx={{ mb: 1.5, borderRadius: 2 }}
                  />
                ))}
              </CardContent>
            </Card>
            <Card sx={{ flex: 1, height: 280, borderRadius: 3 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Skeleton
                  variant="text"
                  width="60%"
                  height={24}
                  sx={{ mb: 2 }}
                />
                {[...Array(6)].map((_, i) => (
                  <Skeleton
                    key={i}
                    variant="rectangular"
                    height={40}
                    sx={{ mb: 1.5, borderRadius: 2 }}
                  />
                ))}
              </CardContent>
            </Card>
            <Card sx={{ flex: 1, height: 280, borderRadius: 3 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Skeleton
                  variant="text"
                  width="40%"
                  height={24}
                  sx={{ mb: 2 }}
                />
                {[...Array(5)].map((_, i) => (
                  <Skeleton
                    key={i}
                    variant="rectangular"
                    height={40}
                    sx={{ mb: 1.5, borderRadius: 2 }}
                  />
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
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 4 }}> {/* Adicionar padding bottom para scroll completo */}
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 3 }}>
        <Typography variant="h4" component="h1">
          Dashboard Administrativo
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ display: { xs: 'none', md: 'block' } }}
        >
          Visão geral do sistema e métricas principais
        </Typography>
        {isLoading && <CircularProgress size={20} sx={{ ml: 2 }} />}
      </Box>

      {/* Alerta de erro (se há erro mas dados em cache) */}
      {error && metrics && (
        <Alert
          severity="warning"
          sx={{ mb: 2 }}
          action={
            <Refresh sx={{ cursor: 'pointer' }} onClick={refreshMetrics} />
          }
        >
          Erro ao atualizar: {error} - Exibindo dados em cache
        </Alert>
      )}

      {/* Cards Superiores - Totais */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 1.5,
            width: '95%',
          }}
        >
          <Card
            sx={{
              flex: 1,
              height: 100,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              boxShadow: '0 3px 12px rgba(102, 126, 234, 0.3)',
              borderRadius: 2,
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 6px 18px rgba(102, 126, 234, 0.4)',
              },
            }}
          >
            <CardContent
              sx={{
                p: 1.5,
                height: '100%',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                width="100%"
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    color="rgba(255,255,255,0.8)"
                    variant="caption"
                    fontWeight={500}
                    sx={{ fontSize: '0.75rem', display: 'block' }}
                  >
                    Total de Médicos
                  </Typography>
                  <Typography
                    variant="h4"
                    component="div"
                    fontWeight="bold"
                    sx={{
                      lineHeight: 1.1,
                      my: 0.3,
                      fontSize: { xs: '1.5rem', sm: '2rem' },
                    }}
                  >
                    {metrics.usuarios.usuariosPorPerfil.medicos}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="rgba(255,255,255,0.9)"
                    sx={{ fontSize: '0.7rem', display: 'block' }}
                  >
                    {Math.max(
                      0,
                      metrics.usuarios.usuariosAtivos -
                        metrics.usuarios.usuariosPorPerfil.administradores
                    )}{' '}
                    ativos
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    width: 40,
                    height: 40,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    ml: 1,
                  }}
                >
                  <LocalHospital sx={{ fontSize: 20, color: 'white' }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>

          <Card
            sx={{
              flex: 1,
              height: 100,
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              boxShadow: '0 3px 12px rgba(240, 147, 251, 0.3)',
              borderRadius: 2,
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 6px 18px rgba(240, 147, 251, 0.4)',
              },
            }}
          >
            <CardContent
              sx={{
                p: 1.5,
                height: '100%',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                width="100%"
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    color="rgba(255,255,255,0.8)"
                    variant="caption"
                    fontWeight={500}
                    sx={{ fontSize: '0.75rem', display: 'block' }}
                  >
                    Total de Pacientes
                  </Typography>
                  <Typography
                    variant="h4"
                    component="div"
                    fontWeight="bold"
                    sx={{
                      lineHeight: 1.1,
                      my: 0.3,
                      fontSize: { xs: '1.5rem', sm: '2rem' },
                    }}
                  >
                    {metrics.pacientes.totalPacientes}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="rgba(255,255,255,0.9)"
                    sx={{ fontSize: '0.7rem', display: 'block' }}
                  >
                    {metrics.pacientes.novosUltimos30Dias} novos (30 dias)
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    width: 40,
                    height: 40,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    ml: 1,
                  }}
                >
                  <People sx={{ fontSize: 20, color: 'white' }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>

          <Card
            sx={{
              flex: 1,
              height: 100,
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              boxShadow: '0 3px 12px rgba(79, 172, 254, 0.3)',
              borderRadius: 2,
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 6px 18px rgba(79, 172, 254, 0.4)',
              },
            }}
          >
            <CardContent
              sx={{
                p: 1.5,
                height: '100%',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                width="100%"
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    color="rgba(255,255,255,0.8)"
                    variant="caption"
                    fontWeight={500}
                    sx={{ fontSize: '0.75rem', display: 'block' }}
                  >
                    Total de Exames
                  </Typography>
                  <Typography
                    variant="h4"
                    component="div"
                    fontWeight="bold"
                    sx={{
                      lineHeight: 1.1,
                      my: 0.3,
                      fontSize: { xs: '1.5rem', sm: '2rem' },
                    }}
                  >
                    {metrics.exames.totalExames}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="rgba(255,255,255,0.9)"
                    sx={{ fontSize: '0.7rem', display: 'block' }}
                  >
                    {metrics.exames.examesUltimos30Dias} últimos 30 dias
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    width: 40,
                    height: 40,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    ml: 1,
                  }}
                >
                  <Assignment sx={{ fontSize: 20, color: 'white' }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>

          <Card
            sx={{
              flex: 1,
              height: 100,
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              color: 'white',
              boxShadow: '0 3px 12px rgba(250, 112, 154, 0.3)',
              borderRadius: 2,
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 6px 18px rgba(250, 112, 154, 0.4)',
              },
            }}
          >
            <CardContent
              sx={{
                p: 1.5,
                height: '100%',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                width="100%"
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    color="rgba(255,255,255,0.8)"
                    variant="caption"
                    fontWeight={500}
                    sx={{ fontSize: '0.75rem', display: 'block' }}
                  >
                    Crescimento Mensal
                  </Typography>
                  <Typography
                    variant="h4"
                    component="div"
                    fontWeight="bold"
                    sx={{
                      lineHeight: 1.1,
                      my: 0.3,
                      fontSize: { xs: '1.5rem', sm: '2rem' },
                    }}
                  >
                    {(() => {
                      const current =
                        metrics.crescimento.pacientes[
                          metrics.crescimento.pacientes.length - 1
                        ]?.total;
                      const previous =
                        metrics.crescimento.pacientes[
                          metrics.crescimento.pacientes.length - 2
                        ]?.total;

                      if (
                        typeof current === 'string' ||
                        typeof previous === 'string'
                      ) {
                        return 'N/A';
                      }

                      return `+${Math.max(0, (current || 0) - (previous || 0))}`;
                    })()}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="rgba(255,255,255,0.9)"
                    sx={{ fontSize: '0.7rem', display: 'block' }}
                  >
                    novos pacientes
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    width: 40,
                    height: 40,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    ml: 1,
                  }}
                >
                  <TrendingUp sx={{ fontSize: 20, color: 'white' }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Cards Inferiores - Estatísticas */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}> {/* Adicionar margin bottom */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            width: '95%',
          }}
        >
          <Card
            sx={{
              flex: 1,
              minHeight: { xs: 320, sm: 280 }, // minHeight em vez de height fixa
              height: 'auto', // Altura auto para expandir conforme conteúdo
              boxShadow: '0 4px 20px rgba(37, 99, 235, 0.08), 0 1px 3px rgba(0, 0, 0, 0.1)',
              borderRadius: 4,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
              border: '1px solid rgba(226, 232, 240, 0.6)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '4px',
                height: '100%',
                background: 'linear-gradient(180deg, #2563eb 0%, #3b82f6 100%)',
                opacity: 0,
                transition: 'opacity 0.3s ease',
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: -30,
                right: -30,
                width: '80px',
                height: '80px',
                background: 'radial-gradient(circle, rgba(37, 99, 235, 0.05) 0%, transparent 70%)',
                borderRadius: '50%',
                transition: 'all 0.4s ease',
              },
              '&:hover': {
                transform: 'translateY(-6px) scale(1.02)',
                boxShadow: '0 12px 40px rgba(37, 99, 235, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)',
                '&::before': {
                  opacity: 1,
                },
                '&::after': {
                  transform: 'scale(1.2)',
                  opacity: 0.8,
                },
              },
            }}
          >
            <CardContent
              sx={{
                p: 2.5,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                fontWeight="bold"
                color="primary.main"
                sx={{ fontSize: '1rem', mb: 2 }}
              >
                Médicos
              </Typography>
              <Box sx={{ flex: 1 }}> {/* Remover overflow: auto para não cortar conteúdo */}
                {metrics.crescimento.usuarios.map((item, index) => {
                  let comparacao = '';
                  let corComparacao = 'text.secondary';
                  let iconeComparacao = null;

                  if (
                    index > 0 &&
                    typeof item.total === 'number' &&
                    typeof metrics.crescimento.usuarios[index - 1].total ===
                      'number'
                  ) {
                    const atual = Number(item.total);
                    const anterior = Number(
                      metrics.crescimento.usuarios[index - 1].total
                    );

                    if (atual > anterior) {
                      comparacao = 'maior';
                      corComparacao = 'success.main';
                      iconeComparacao = (
                        <TrendingUp
                          sx={{
                            fontSize: '1rem',
                            color: 'success.main',
                            ml: 0.5,
                          }}
                        />
                      );
                    } else if (atual < anterior) {
                      comparacao = 'menor';
                      corComparacao = 'error.main';
                      iconeComparacao = (
                        <TrendingDown
                          sx={{
                            fontSize: '1rem',
                            color: 'error.main',
                            ml: 0.5,
                          }}
                        />
                      );
                    } else {
                      comparacao = 'equivalente';
                      corComparacao = 'warning.main';
                      iconeComparacao = (
                        <TrendingFlat
                          sx={{
                            fontSize: '1rem',
                            color: 'warning.main',
                            ml: 0.5,
                          }}
                        />
                      );
                    }
                  } else {
                    // Para o primeiro item ou quando não há comparação, mostrar ícone neutro
                    comparacao = 'inicial';
                    corComparacao = 'text.secondary';
                    iconeComparacao = (
                      <TrendingFlat
                        sx={{
                          fontSize: '1rem',
                          color: 'text.secondary',
                          ml: 0.5,
                        }}
                      />
                    );
                  }

                  return (
                    <Box
                      key={item.mes}
                      display="flex"
                      justifyContent="flex-start"
                      alignItems="center"
                      sx={{
                        mb: 0.2,
                        p: 0.6,
                        borderRadius: 2,
                        bgcolor: 'primary.50',
                        transition: 'all 0.2s ease',
                        '&:hover': { bgcolor: 'primary.100' },
                      }}
                    >
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        width="100%"
                      >
                        <Typography
                          variant="body2"
                          fontWeight={500}
                          sx={{ fontSize: '0.85rem', minWidth: '60px' }}
                        >
                          {item.mes}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            color="primary.main"
                            sx={{ fontSize: '0.85rem', fontFamily: 'monospace', minWidth: '30px', textAlign: 'right' }}
                          >
                            {formatNumber(Number(item.total))}
                          </Typography>
                          {iconeComparacao}
                          {comparacao && (
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: '0.75rem',
                                color: corComparacao,
                                ml: 0.5,
                                minWidth: '70px',
                              }}
                            >
                              {comparacao}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>

          <Card
            sx={{
              flex: 1,
              minHeight: { xs: 320, sm: 280 },
              height: 'auto',
              boxShadow: '0 4px 20px rgba(5, 150, 105, 0.08), 0 1px 3px rgba(0, 0, 0, 0.1)',
              borderRadius: 4,
              background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 50%, #ecfdf5 100%)',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '4px',
                height: '100%',
                background: 'linear-gradient(180deg, #059669 0%, #22c55e 100%)',
                opacity: 0,
                transition: 'opacity 0.3s ease',
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: -30,
                right: -30,
                width: '80px',
                height: '80px',
                background: 'radial-gradient(circle, rgba(5, 150, 105, 0.05) 0%, transparent 70%)',
                borderRadius: '50%',
                transition: 'all 0.4s ease',
              },
              '&:hover': {
                transform: 'translateY(-6px) scale(1.02)',
                boxShadow: '0 12px 40px rgba(5, 150, 105, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)',
                '&::before': {
                  opacity: 1,
                },
                '&::after': {
                  transform: 'scale(1.2)',
                  opacity: 0.8,
                },
              },
            }}
          >
            <CardContent
              sx={{
                p: 2.5,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                fontWeight="bold"
                color="secondary.main"
                sx={{ fontSize: '1rem', mb: 2 }}
              >
                Pacientes e Exames
              </Typography>
              <Box sx={{ flex: 1 }}>
                {metrics.crescimento.pacientes.map((item, index) => (
                  <Box
                    key={item.mes}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                      mb: 0.2,
                      p: 0.6,
                      borderRadius: 2,
                      bgcolor: 'secondary.50',
                      transition: 'all 0.2s ease',
                      '&:hover': { bgcolor: 'secondary.100' },
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      sx={{ fontSize: '0.85rem' }}
                    >
                      {item.mes}
                    </Typography>
                    <Box display="flex" gap={2}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: '0.75rem' }}
                        >
                          Pacientes:
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color="success.main"
                          sx={{ fontSize: '0.8rem', fontFamily: 'monospace' }}
                        >
                          {formatNumber(Number(item.total))}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: '0.75rem' }}
                        >
                          Exames:
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color="info.main"
                          sx={{ fontSize: '0.8rem', fontFamily: 'monospace' }}
                        >
                          {formatNumber(
                            Number(
                              metrics.crescimento.exames[index]?.total || 0
                            )
                          )}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          <Card
            sx={{
              flex: 1,
              minHeight: { xs: 320, sm: 280 },
              height: 'auto',
              boxShadow: '0 4px 20px rgba(245, 158, 11, 0.08), 0 1px 3px rgba(0, 0, 0, 0.1)',
              borderRadius: 4,
              background: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 50%, #fef3c7 100%)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '4px',
                height: '100%',
                background: 'linear-gradient(180deg, #f59e0b 0%, #fbbf24 100%)',
                opacity: 0,
                transition: 'opacity 0.3s ease',
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: -30,
                right: -30,
                width: '80px',
                height: '80px',
                background: 'radial-gradient(circle, rgba(245, 158, 11, 0.05) 0%, transparent 70%)',
                borderRadius: '50%',
                transition: 'all 0.4s ease',
              },
              '&:hover': {
                transform: 'translateY(-6px) scale(1.02)',
                boxShadow: '0 12px 40px rgba(245, 158, 11, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)',
                '&::before': {
                  opacity: 1,
                },
                '&::after': {
                  transform: 'scale(1.2)',
                  opacity: 0.8,
                },
              },
            }}
          >
            <CardContent
              sx={{
                p: 2.5,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                fontWeight="bold"
                color="warning.main"
                sx={{ fontSize: '1rem', mb: 2 }}
              >
                Atividades
              </Typography>
              <Box sx={{ flex: 1 }}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    mb: 0.2,
                    p: 0.6,
                    borderRadius: 2,
                    bgcolor: 'warning.50',
                    transition: 'all 0.2s ease',
                    '&:hover': { bgcolor: 'warning.100' },
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    sx={{ fontSize: '0.85rem' }}
                  >
                    Novo médico cadastrado
                  </Typography>
                  <Typography
                    variant="caption"
                    color="success.main"
                    fontWeight={500}
                    sx={{ fontSize: '0.75rem' }}
                  >
                    Hoje
                  </Typography>
                </Box>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    mb: 0.2,
                    p: 0.6,
                    borderRadius: 2,
                    bgcolor: 'warning.50',
                    transition: 'all 0.2s ease',
                    '&:hover': { bgcolor: 'warning.100' },
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    sx={{ fontSize: '0.85rem' }}
                  >
                    3 novos pacientes
                  </Typography>
                  <Typography
                    variant="caption"
                    color="info.main"
                    fontWeight={500}
                    sx={{ fontSize: '0.75rem' }}
                  >
                    Ontem
                  </Typography>
                </Box>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    mb: 0.2,
                    p: 0.6,
                    borderRadius: 2,
                    bgcolor: 'warning.50',
                    transition: 'all 0.2s ease',
                    '&:hover': { bgcolor: 'warning.100' },
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    sx={{ fontSize: '0.85rem' }}
                  >
                    15 exames realizados
                  </Typography>
                  <Typography
                    variant="caption"
                    color="primary.main"
                    fontWeight={500}
                    sx={{ fontSize: '0.75rem' }}
                  >
                    Ontem
                  </Typography>
                </Box>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    mb: 0.2,
                    p: 0.6,
                    borderRadius: 2,
                    bgcolor: 'warning.50',
                    transition: 'all 0.2s ease',
                    '&:hover': { bgcolor: 'warning.100' },
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    sx={{ fontSize: '0.85rem' }}
                  >
                    Sistema atualizado
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={500}
                    sx={{ fontSize: '0.75rem' }}
                  >
                    2 dias
                  </Typography>
                </Box>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    mb: 0.2,
                    p: 0.6,
                    borderRadius: 2,
                    bgcolor: 'warning.50',
                    transition: 'all 0.2s ease',
                    '&:hover': { bgcolor: 'warning.100' },
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    sx={{ fontSize: '0.85rem' }}
                  >
                    Backup realizado
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={500}
                    sx={{ fontSize: '0.75rem' }}
                  >
                    3 dias
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Indicadores de Scroll para Mobile */}
      <DashboardScrollIndicators />
    </Box>
  );
};

export default AdminDashboard;
