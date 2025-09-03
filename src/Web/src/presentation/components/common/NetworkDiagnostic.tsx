import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  ExpandMore,
  CheckCircle,
  Error,
  Warning,
  Refresh,
  NetworkCheck,
} from '@mui/icons-material';
import { apiConfig } from '../../../infrastructure/utils/apiConfig';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

const NetworkDiagnostic: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);

    const diagnostics: DiagnosticResult[] = [];

    // 1. Verificar configuração da API
    const config = apiConfig.getDebugInfo();
    diagnostics.push({
      test: 'Configuração da API',
      status: 'success',
      message: `Base URL: ${config.baseUrl}`,
      details: JSON.stringify(config, null, 2),
    });

    // 1.1 Verificar se é ngrok e se está configurado corretamente
    if (config.isNgrok) {
      const ngrokApiUrl = import.meta.env.VITE_NGROK_API_URL;
      diagnostics.push({
        test: 'Configuração ngrok',
        status: ngrokApiUrl ? 'success' : 'warning',
        message: ngrokApiUrl ? 'ngrok API configurado' : 'ngrok API não configurado',
        details: ngrokApiUrl 
          ? `VITE_NGROK_API_URL: ${ngrokApiUrl}` 
          : 'Configure VITE_NGROK_API_URL no .env.local com a URL HTTPS do ngrok da API',
      });
    }

    // 2. Testar conectividade com a API
    try {
      const isConnected = await apiConfig.testConnection();
      diagnostics.push({
        test: 'Conectividade com API',
        status: isConnected ? 'success' : 'error',
        message: isConnected
          ? 'API respondendo corretamente'
          : 'API não está respondendo',
        details: `Testando endpoint: ${config.baseUrl}/health/ready`,
      });
    } catch (error: any) {
      diagnostics.push({
        test: 'Conectividade com API',
        status: 'error',
        message: 'Erro ao testar conectividade',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }

    // 3. Verificar se está sendo acessado via ngrok
    const isNgrok = window.location.hostname.includes('.ngrok');
    diagnostics.push({
      test: 'Detecção de Ngrok',
      status: isNgrok ? 'warning' : 'success',
      message: isNgrok
        ? 'Acessando via ngrok - configuração especial aplicada'
        : 'Acesso local/direto',
      details: `Hostname atual: ${window.location.hostname}`,
    });

    // 4. Verificar CORS
    try {
      const response = await fetch(`${config.baseUrl}/health/ready`, {
        method: 'GET',
        mode: 'cors',
      });
      diagnostics.push({
        test: 'CORS Configuration',
        status: response.ok ? 'success' : 'warning',
        message: response.ok
          ? 'CORS configurado corretamente'
          : 'Possível problema de CORS',
        details: `Status: ${response.status} ${response.statusText}`,
      });
    } catch (error: any) {
      diagnostics.push({
        test: 'CORS Configuration',
        status: 'error',
        message: 'Erro de CORS detectado',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }

    // 5. Verificar localStorage (auth)
    try {
      const authData = localStorage.getItem('auth-store');
      const hasAuth = !!authData;
      diagnostics.push({
        test: 'Autenticação Local',
        status: hasAuth ? 'success' : 'warning',
        message: hasAuth
          ? 'Dados de autenticação encontrados'
          : 'Nenhum dado de autenticação',
        details: hasAuth
          ? 'Token presente no localStorage'
          : 'Faça login novamente',
      });
    } catch (error: any) {
      diagnostics.push({
        test: 'Autenticação Local',
        status: 'error',
        message: 'Erro ao verificar autenticação',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }

    setResults(diagnostics);
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle color="success" />;
      case 'error':
        return <Error color="error" />;
      case 'warning':
        return <Warning color="warning" />;
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
    }
  };

  const hasErrors = results.some(r => r.status === 'error');
  const hasWarnings = results.some(r => r.status === 'warning');

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <NetworkCheck color="primary" />
          <Typography variant="h6">Diagnóstico de Rede</Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={isRunning ? <CircularProgress size={16} /> : <Refresh />}
            onClick={runDiagnostics}
            disabled={isRunning}
          >
            {isRunning ? 'Testando...' : 'Testar Novamente'}
          </Button>
        </Box>

        {results.length > 0 && (
          <>
            {hasErrors && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Problemas de conectividade detectados. Verifique se a API está
                rodando.
              </Alert>
            )}

            {hasWarnings && !hasErrors && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Configuração especial detectada (ngrok ou rede externa).
              </Alert>
            )}

            {!hasErrors && !hasWarnings && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Todos os testes passaram! Sistema funcionando corretamente.
              </Alert>
            )}

            <List>
              {results.map((result, index) => (
                <ListItem key={index}>
                  <ListItemIcon>{getStatusIcon(result.status)}</ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body1">{result.test}</Typography>
                        <Chip
                          size="small"
                          label={result.status}
                          color={getStatusColor(result.status)}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={result.message}
                  />
                </ListItem>
              ))}
            </List>

            <Accordion
              expanded={showDetails}
              onChange={() => setShowDetails(!showDetails)}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="body2">Detalhes Técnicos</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box
                  component="pre"
                  sx={{
                    fontSize: '0.75rem',
                    overflow: 'auto',
                    backgroundColor: 'grey.100',
                    p: 2,
                    borderRadius: 1,
                  }}
                >
                  {results.map((result, index) => (
                    <Box key={index} mb={2}>
                      <Typography variant="caption" fontWeight="bold">
                        {result.test}:
                      </Typography>
                      <br />
                      {result.details}
                      <br />
                      <br />
                    </Box>
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default NetworkDiagnostic;
