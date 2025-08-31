import React from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import { Refresh, Warning } from '@mui/icons-material';

interface RetryComponentProps {
  error: Error | string;
  onRetry: () => void;
  loading?: boolean;
  maxRetries?: number;
  currentRetry?: number;
  showDetails?: boolean;
}

const RetryComponent: React.FC<RetryComponentProps> = ({
  error,
  onRetry,
  loading = false,
  maxRetries = 3,
  currentRetry = 0,
  showDetails = false,
}) => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const hasRetriesLeft = currentRetry < maxRetries;

  return (
    <Card>
      <CardContent>
        <Box textAlign="center" py={2}>
          <Warning sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />

          <Typography variant="h6" gutterBottom>
            Erro ao carregar dados
          </Typography>

          <Typography variant="body2" color="text.secondary" paragraph>
            {errorMessage}
          </Typography>

          {showDetails && typeof error !== 'string' && (
            <Alert severity="error" sx={{ mt: 2, mb: 2, textAlign: 'left' }}>
              <Typography
                variant="caption"
                component="pre"
                sx={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {error.stack}
              </Typography>
            </Alert>
          )}

          {hasRetriesLeft && (
            <Box>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={onRetry}
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? 'Tentando novamente...' : 'Tentar Novamente'}
              </Button>

              {maxRetries > 1 && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: 'block' }}
                >
                  Tentativa {currentRetry + 1} de {maxRetries}
                </Typography>
              )}
            </Box>
          )}

          {!hasRetriesLeft && (
            <Alert severity="error" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Número máximo de tentativas excedido. Recarregue a página ou
                entre em contato com o suporte.
              </Typography>
            </Alert>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default RetryComponent;
