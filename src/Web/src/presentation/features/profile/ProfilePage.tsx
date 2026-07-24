import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { apiClient } from '../../../infrastructure/api/client';
import { useAuthStore } from '../../../application/stores/authStore';
import type { Usuario } from '../../../domain/entities/Usuario';
import { UserProfile } from '../../../domain/enums/UserProfile';
import { standardCardStyles, standardCardContentStyles } from '../../styles/cardStyles';

const ProfilePage: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const [displayName, setDisplayName] = useState(user?.displayName || user?.username || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const profileLabel = user?.role === UserProfile.ADMINISTRADOR ? 'Administrador' : 'Médico';

  const handleSave = async () => {
    setSuccess('');
    setError('');

    if (password && password !== confirmPassword) {
      setError('A confirmação de senha não confere.');
      return;
    }

    try {
      setSaving(true);
      const response = await apiClient.put('/me', {
        displayName,
        password: password || undefined,
      });

      const updatedUser: Usuario = {
        id: response.data.id,
        username: response.data.username,
        displayName: response.data.displayName || response.data.username,
        role: response.data.role as UserProfile,
        isActive: response.data.isActive,
      };

      setUser(updatedUser);
      setPassword('');
      setConfirmPassword('');
      setSuccess('Perfil atualizado com sucesso.');
    } catch (saveError: unknown) {
      const message = saveError instanceof Error ? saveError.message : 'Erro ao atualizar perfil.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 3 }}>
        <Typography variant="h4" component="h1">
          Meu Perfil
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ display: { xs: 'none', md: 'block' } }}
        >
          Dados do usuário autenticado
        </Typography>
      </Box>

      <Card sx={{ ...standardCardStyles, maxWidth: 760 }}>
        <CardContent sx={standardCardContentStyles}>
          <Stack spacing={2.25}>
            {success && <Alert severity="success">{success}</Alert>}
            {error && <Alert severity="error">{error}</Alert>}

            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
              <TextField
                label="Nome exibido"
                value={displayName}
                onChange={event => setDisplayName(event.target.value)}
                fullWidth
              />
              <TextField
                label="Perfil"
                value={profileLabel}
                fullWidth
                disabled
              />
            </Box>

            <TextField
              label="Usuário de acesso"
              value={user?.username || ''}
              fullWidth
              disabled
            />

            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
              <TextField
                label="Nova senha"
                type="password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                fullWidth
                helperText="Deixe em branco para manter a senha atual."
              />
              <TextField
                label="Confirmar nova senha"
                type="password"
                value={confirmPassword}
                onChange={event => setConfirmPassword(event.target.value)}
                fullWidth
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                disabled={saving}
                sx={{ minWidth: 160, textTransform: 'none', fontWeight: 600 }}
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfilePage;