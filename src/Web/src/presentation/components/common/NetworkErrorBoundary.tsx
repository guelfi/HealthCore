import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Alert,
  AlertTitle,
  Button,
  Typography,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  Refresh,
  ExpandMore,
  ExpandLess,
  BugReport,
  NetworkCheck,
} from '@mui/icons-material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  isNetworkError: boolean;
}

class NetworkErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      isNetworkError: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Detectar se é um erro de rede
    const isNetworkError =
      error.message.includes('Network Error') ||
      error.message.includes('fetch') ||
      error.message.includes('CORS') ||
      error.message.includes('ERR_NETWORK') ||
      error.name === 'NetworkError';

    return {
      hasError: true,
      error,
      isNetworkError,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log do erro para debugging
    console.error('NetworkErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      isNetworkError: false,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleDiagnostic = () => {
    window.open('/diagnostic', '_blank');
  };

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, showDetails, isNetworkError } = this.state;

      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="50vh"
          p={3}
        >
          <Alert
            severity={isNetworkError ? 'warning' : 'error'}
            sx={{ maxWidth: 600, width: '100%' }}
          >
            <AlertTitle>
              {isNetworkError ? (
                <>
                  <NetworkCheck sx={{ mr: 1 }} />
                  Problema de Conectividade
                </>
              ) : (
                <>
                  <BugReport sx={{ mr: 1 }} />
                  Erro na Aplicação
                </>
              )}
            </AlertTitle>

            {isNetworkError ? (
              <Typography variant="body2" gutterBottom>
                Não foi possível conectar com o servidor. Isso pode acontecer
                quando:
              </Typography>
            ) : (
              <Typography variant="body2" gutterBottom>
                Ocorreu um erro inesperado na aplicação.
              </Typography>
            )}

            {isNetworkError && (
              <Box component="ul" sx={{ mt: 1, mb: 2, pl: 2 }}>
                <li>A API não está rodando</li>
                <li>Há problemas de rede ou CORS</li>
                <li>Você está acessando via ngrok sem configuração adequada</li>
              </Box>
            )}

            <Box display="flex" gap={1} flexWrap="wrap" mt={2}>
              <Button
                variant="contained"
                size="small"
                startIcon={<Refresh />}
                onClick={this.handleRetry}
              >
                Tentar Novamente
              </Button>

              <Button
                variant="outlined"
                size="small"
                onClick={this.handleReload}
              >
                Recarregar Página
              </Button>

              {isNetworkError && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<NetworkCheck />}
                  onClick={this.handleDiagnostic}
                >
                  Diagnóstico
                </Button>
              )}

              <Button
                variant="text"
                size="small"
                endIcon={showDetails ? <ExpandLess /> : <ExpandMore />}
                onClick={this.toggleDetails}
              >
                Detalhes Técnicos
              </Button>
            </Box>

            <Collapse in={showDetails}>
              <Box mt={2} p={2} bgcolor="grey.100" borderRadius={1}>
                <Typography variant="caption" component="div" gutterBottom>
                  <strong>Erro:</strong> {error?.message}
                </Typography>

                <Typography variant="caption" component="div" gutterBottom>
                  <strong>Stack:</strong>
                </Typography>

                <Box
                  component="pre"
                  sx={{
                    fontSize: '0.7rem',
                    overflow: 'auto',
                    maxHeight: 200,
                    backgroundColor: 'grey.50',
                    p: 1,
                    borderRadius: 0.5,
                    border: '1px solid',
                    borderColor: 'grey.300',
                  }}
                >
                  {error?.stack}
                </Box>

                {errorInfo && (
                  <>
                    <Typography
                      variant="caption"
                      component="div"
                      gutterBottom
                      sx={{ mt: 1 }}
                    >
                      <strong>Component Stack:</strong>
                    </Typography>
                    <Box
                      component="pre"
                      sx={{
                        fontSize: '0.7rem',
                        overflow: 'auto',
                        maxHeight: 150,
                        backgroundColor: 'grey.50',
                        p: 1,
                        borderRadius: 0.5,
                        border: '1px solid',
                        borderColor: 'grey.300',
                      }}
                    >
                      {errorInfo.componentStack}
                    </Box>
                  </>
                )}
              </Box>
            </Collapse>
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default NetworkErrorBoundary;
