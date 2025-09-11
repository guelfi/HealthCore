import React from 'react';
import { Box, Typography, Container, useTheme } from '@mui/material';
import { LocalHospital, Copyright } from '@mui/icons-material';

interface FooterProps {
  compact?: boolean;
}

const Footer: React.FC<FooterProps> = ({ compact = false }) => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  if (compact) {
    // Layout compacto para sidebar
    return (
      <Box
        component="footer"
        sx={{
          py: 1,
          px: 1.5,
          backgroundColor: theme.palette.grey[50],
          borderTop: `1px solid ${theme.palette.divider}`,
          minHeight: '48px',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          {/* Logo e Nome */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocalHospital
              sx={{
                color: theme.palette.primary.main,
                fontSize: '1rem',
              }}
            />
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: theme.palette.primary.main,
                fontSize: '0.8rem',
              }}
            >
              HealthCore
            </Typography>
          </Box>

          {/* Copyright compacto */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
            <Copyright
              sx={{
                fontSize: '0.7rem',
                color: 'text.secondary',
              }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: '0.65rem' }}
            >
              {currentYear}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  // Layout normal para parte inferior
  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: 1.5,
        px: 2,
        backgroundColor: theme.palette.grey[100],
        borderTop: `1px solid ${theme.palette.divider}`,
        minHeight: '56px',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          {/* Logo e Nome */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalHospital
              sx={{
                color: theme.palette.primary.main,
                fontSize: '1.25rem',
              }}
            />
            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
                color: theme.palette.primary.main,
                fontSize: '0.95rem',
              }}
            >
              HealthCore
            </Typography>
          </Box>

          {/* Informações Centrais */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: '0.8rem' }}
            >
              Sistema de Gestão Médica
            </Typography>
            <Typography variant="body2" color="text.secondary">
              •
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: '0.8rem' }}
            >
              Versão 1.0.0
            </Typography>
          </Box>

          {/* Copyright */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Copyright
              sx={{
                fontSize: '0.9rem',
                color: 'text.secondary',
              }}
            />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: '0.8rem' }}
            >
              {currentYear} HealthCore
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
