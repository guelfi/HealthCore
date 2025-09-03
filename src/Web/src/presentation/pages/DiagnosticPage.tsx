import React from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Alert,
} from '@mui/material';
import {
  Computer,
  Cloud,
  NetworkCheck,
  Settings,
  BugReport,
} from '@mui/icons-material';
import NetworkDiagnostic from '../components/common/NetworkDiagnostic';
import { apiConfig } from '../../infrastructure/utils/apiConfig';
import { useResponsive } from '../hooks/useResponsive';

const DiagnosticPage: React.FC = () => {
  const { isMobile, isTablet } = useResponsive();
  const config = apiConfig.getDebugInfo();

  const systemInfo = {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    screen: `${screen.width}x${screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    deviceType: isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop',
  };

  const handleCopyInfo = () => {
    const info = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      apiConfig: config,
      systemInfo,
    };

    navigator.clipboard.writeText(JSON.stringify(info, null, 2));
    alert('Informações copiadas para a área de transferência!');
  };

  return (
    <Container maxWidth="lg">
      <Box py={3}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <BugReport color="primary" />
          <Typography variant="h4" component="h1">
            Diagnóstico do Sistema
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          Esta página ajuda a diagnosticar problemas de conectividade e
          configuração. Use-a quando encontrar erros de "Network Error" ou
          problemas de acesso.
        </Alert>

        <Grid container spacing={3}>
          {/* Diagnóstico de Rede */}
          <Grid item xs={12}>
            <NetworkDiagnostic />
          </Grid>

          {/* Informações do Sistema */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Computer color="primary" />
                  <Typography variant="h6">Informações do Sistema</Typography>
                </Box>

                <Box display="flex" flexDirection="column" gap={1}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2" color="textSecondary">
                      Tipo de Dispositivo:
                    </Typography>
                    <Chip
                      label={systemInfo.deviceType}
                      size="small"
                      color={isMobile ? 'secondary' : 'primary'}
                    />
                  </Box>

                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2" color="textSecondary">
                      Resolução da Tela:
                    </Typography>
                    <Typography variant="body2">{systemInfo.screen}</Typography>
                  </Box>

                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2" color="textSecondary">
                      Viewport:
                    </Typography>
                    <Typography variant="body2">
                      {systemInfo.viewport}
                    </Typography>
                  </Box>

                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2" color="textSecondary">
                      Online:
                    </Typography>
                    <Chip
                      label={systemInfo.onLine ? 'Sim' : 'Não'}
                      size="small"
                      color={systemInfo.onLine ? 'success' : 'error'}
                    />
                  </Box>

                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2" color="textSecondary">
                      Cookies:
                    </Typography>
                    <Chip
                      label={
                        systemInfo.cookieEnabled
                          ? 'Habilitados'
                          : 'Desabilitados'
                      }
                      size="small"
                      color={systemInfo.cookieEnabled ? 'success' : 'error'}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Configuração da API */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Settings color="primary" />
                  <Typography variant="h6">Configuração da API</Typography>
                </Box>

                <Box display="flex" flexDirection="column" gap={1}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Base URL:
                    </Typography>
                    <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                      {config.baseUrl}
                    </Typography>
                  </Box>

                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2" color="textSecondary">
                      Timeout:
                    </Typography>
                    <Typography variant="body2">{config.timeout}ms</Typography>
                  </Box>

                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2" color="textSecondary">
                      Ambiente:
                    </Typography>
                    <Chip
                      label={config.environment}
                      size="small"
                      color="primary"
                    />
                  </Box>

                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2" color="textSecondary">
                      Via Ngrok:
                    </Typography>
                    <Chip
                      label={config.isNgrok ? 'Sim' : 'Não'}
                      size="small"
                      color={config.isNgrok ? 'warning' : 'success'}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Ações */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Ações de Diagnóstico
                </Typography>

                <Box display="flex" gap={2} flexWrap="wrap">
                  <Button
                    variant="outlined"
                    startIcon={<NetworkCheck />}
                    onClick={() => window.location.reload()}
                  >
                    Recarregar Página
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<Settings />}
                    onClick={handleCopyInfo}
                  >
                    Copiar Informações
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<Cloud />}
                    onClick={() =>
                      window.open(config.baseUrl + '/swagger', '_blank')
                    }
                  >
                    Abrir Swagger da API
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default DiagnosticPage;
