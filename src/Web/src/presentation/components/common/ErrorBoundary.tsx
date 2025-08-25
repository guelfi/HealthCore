import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  Container,
} from '@mui/material';
import { Refresh, Home, BugReport } from '@mui/icons-material';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // In production, you would send this to your error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Box textAlign="center">
            <BugReport sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            
            <Typography variant="h4" component="h1" gutterBottom>
              Oops! Algo deu errado
            </Typography>
            
            <Typography variant="body1" color="text.secondary" paragraph>
              Ocorreu um erro inesperado na aplicação. Nossa equipe foi notificada.
            </Typography>

            <Card sx={{ mt: 3, mb: 3 }}>
              <CardContent>
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Detalhes do Erro
                  </Typography>
                  <Typography variant="body2" component="pre" sx={{ 
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontSize: '0.875rem',
                  }}>
                    {this.state.error?.message}
                  </Typography>
                </Alert>

                {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                  <Alert severity="warning">
                    <Typography variant="h6" gutterBottom>
                      Stack Trace (Desenvolvimento)
                    </Typography>
                    <Typography variant="body2" component="pre" sx={{ 
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontSize: '0.75rem',
                      maxHeight: 200,
                      overflow: 'auto',
                    }}>
                      {this.state.errorInfo.componentStack}
                    </Typography>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Box display="flex" gap={2} justifyContent="center">
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={this.handleReload}
              >
                Recarregar Página
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Home />}
                onClick={this.handleGoHome}
              >
                Ir para Dashboard
              </Button>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: 'block' }}>
              Se o problema persistir, entre em contato com o suporte técnico.
            </Typography>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;