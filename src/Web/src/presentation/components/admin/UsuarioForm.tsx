import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Save, ArrowBack, Visibility, VisibilityOff, Refresh } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
// import type { CreateUsuarioDto } from '../../../domain/entities/Usuario'; // Removido: não utilizado
import { UserProfile } from '../../../domain/enums/UserProfile';
import { useUIStore } from '../../../application/stores/uiStore';

const usuarioSchema = z.object({
  username: z.string().min(3, 'Username deve ter pelo menos 3 caracteres'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  role: z.nativeEnum(UserProfile, { errorMap: () => ({ message: 'Perfil é obrigatório' }) }),
  isActive: z.boolean().optional(),
});

type UsuarioFormData = z.infer<typeof usuarioSchema>;

const UsuarioForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addNotification } = useUIStore();
  const isEditing = Boolean(id);
  
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<UsuarioFormData>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      isActive: true,
    },
  });

  React.useEffect(() => {
    if (isEditing) {
      // Mock data for editing - in real app, would fetch from API
      setValue('username', 'medico1');
      setValue('password', '123456');
      setValue('role', UserProfile.MEDICO);
      setValue('isActive', true);
    }
  }, [isEditing, setValue]);

  const onSubmit = async (data: UsuarioFormData) => {
    setLoading(true);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const action = isEditing ? 'atualizado' : 'cadastrado';
      addNotification(`Usuário ${action} com sucesso!`, 'success');
      navigate('/admin/usuarios');
    } catch (error) {
      addNotification('Erro ao salvar usuário', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setValue('password', password);
    addNotification('Senha gerada automaticamente', 'info');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin/usuarios')}
          variant="outlined"
        >
          Voltar
        </Button>
        <Box>
          <Typography variant="h4" component="h1">
            {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isEditing ? 'Atualize as informações do usuário' : 'Cadastre um novo usuário no sistema'}
          </Typography>
        </Box>
      </Box>

      <Card>
        <CardContent>
          <Box 
            component="form" 
            onSubmit={handleSubmit(onSubmit)}
            sx={{ 
              maxWidth: { xs: '100%', sm: '600px' },
              mx: 'auto'
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                {...register('username')}
                fullWidth
                label="Username *"
                error={!!errors.username}
                helperText={errors.username?.message}
                disabled={loading}
              />

              <FormControl fullWidth error={!!errors.role}>
                <InputLabel>Perfil *</InputLabel>
                <Select
                  {...register('role')}
                  label="Perfil *"
                  disabled={loading}
                >
                  {Object.values(UserProfile).map((profile) => (
                    <MenuItem key={profile} value={profile}>
                      {profile}
                    </MenuItem>
                  ))}
                </Select>
                {errors.role && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                    {errors.role.message}
                  </Typography>
                )}
              </FormControl>

              <TextField
                {...register('password')}
                fullWidth
                label="Senha *"
                type={showPassword ? 'text' : 'password'}
                error={!!errors.password}
                helperText={errors.password?.message}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={generatePassword}
                        edge="end"
                        disabled={loading}
                        title="Gerar senha automática"
                      >
                        <Refresh />
                      </IconButton>
                      <IconButton
                        onClick={togglePasswordVisibility}
                        edge="end"
                        disabled={loading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {isEditing && (
                <FormControlLabel
                  control={
                    <Switch
                      {...register('isActive')}
                      defaultChecked={watch('isActive')}
                      disabled={loading}
                    />
                  }
                  label="Usuário ativo"
                />
              )}

              <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Informações Importantes
                  </Typography>
                  <Typography variant="body2" paragraph>
                    • O username deve ser único no sistema
                  </Typography>
                  <Typography variant="body2" paragraph>
                    • A senha deve ter pelo menos 6 caracteres
                  </Typography>
                  <Typography variant="body2" paragraph>
                    • Administradores têm acesso total ao sistema
                  </Typography>
                  <Typography variant="body2">
                    • Médicos podem gerenciar pacientes e exames
                  </Typography>
                </CardContent>
              </Card>

              <Box display="flex" gap={2} justifyContent="flex-end" mt={2}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/usuarios')}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </Button>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UsuarioForm;