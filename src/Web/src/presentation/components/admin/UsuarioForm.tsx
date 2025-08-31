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
  Alert,
} from '@mui/material';
import {
  Save,
  ArrowBack,
  Visibility,
  VisibilityOff,
  Refresh,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import type { CreateUsuarioDto, UpdateUsuarioDto } from '../../../domain/entities/Usuario';
import { UserProfile } from '../../../domain/enums/UserProfile';
import { useUIStore } from '../../../application/stores/uiStore';
import { useUsuarios } from '../../hooks/useUsuarios';

// Schema base
const baseUsuarioSchema = {
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  username: z.string().min(3, 'Username deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email deve ser válido'),
  role: z.nativeEnum(UserProfile, { message: 'Perfil é obrigatório' }),
  isActive: z.boolean().optional(),
};

// Schema para criação (senha obrigatória)
const createUsuarioSchema = z.object({
  ...baseUsuarioSchema,
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

// Schema para edição (senha opcional)
const editUsuarioSchema = z.object({
  ...baseUsuarioSchema,
  password: z.string().optional().or(z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')),
});

type UsuarioFormData = z.infer<typeof createUsuarioSchema>;

const UsuarioForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addNotification } = useUIStore();
  const isEditing = Boolean(id);

  const [showPassword, setShowPassword] = React.useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = React.useState(false);

  const {
    loading,
    error,
    createUsuario,
    updateUsuario,
    getUsuarioById,
    clearError,
  } = useUsuarios();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<UsuarioFormData>({
    resolver: zodResolver(isEditing ? editUsuarioSchema : createUsuarioSchema),
    defaultValues: {
      isActive: true,
    },
  });

  React.useEffect(() => {
    const loadUsuario = async () => {
      if (isEditing && id && !initialDataLoaded) {
        try {
          const usuario = await getUsuarioById(id);
          setValue('nome', usuario.nome);
          setValue('username', usuario.username);
          setValue('email', usuario.email);
          setValue('password', ''); // Não carregar senha por segurança
          setValue('role', usuario.role);
          setValue('isActive', usuario.isActive);
          setInitialDataLoaded(true);
        } catch (error: any) {
          addNotification(
            error.message || 'Erro ao carregar usuário',
            'error'
          );
          navigate('/admin/usuarios');
        }
      }
    };

    loadUsuario();
  }, [isEditing, id, initialDataLoaded, getUsuarioById, setValue, addNotification, navigate]);

  const onSubmit = async (data: UsuarioFormData) => {
    try {
      clearError();
      
      if (isEditing && id) {
        // Atualizar usuário existente
        const updateData: UpdateUsuarioDto = {
          nome: data.nome,
          username: data.username,
          email: data.email,
          role: data.role,
          isActive: data.isActive ?? true,
        };
        
        // Só incluir senha se foi preenchida
        if (data.password && data.password.trim()) {
          updateData.password = data.password;
        }
        
        await updateUsuario(id, updateData);
        addNotification('Usuário atualizado com sucesso!', 'success');
      } else {
        // Criar novo usuário
        const createData: CreateUsuarioDto = {
          nome: data.nome,
          username: data.username,
          email: data.email,
          password: data.password!,
          role: data.role,
          isActive: data.isActive ?? true,
        };
        
        await createUsuario(createData);
        addNotification('Usuário cadastrado com sucesso!', 'success');
      }
      
      navigate('/admin/usuarios');
    } catch (error: any) {
      addNotification(
        error.message || 'Erro ao salvar usuário',
        'error'
      );
    }
  };

  const generatePassword = () => {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
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
            {isEditing
              ? 'Atualize as informações do usuário'
              : 'Cadastre um novo usuário no sistema'}
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          onClose={clearError}
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: { xs: 1, sm: 1.5 } }}>
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{
              maxWidth: { xs: '100%', sm: '600px' },
              mx: 'auto',
              mt: 1,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: { xs: 1, sm: 1.2 },
              }}
            >
              <TextField
                {...register('nome')}
                fullWidth
                label="Nome Completo *"
                error={!!errors.nome}
                helperText={errors.nome?.message}
                disabled={loading}
                size="small"
                sx={{
                  '& .MuiInputBase-root': {
                    padding: '4px 6px',
                  },
                  '& .MuiInputBase-input': {
                    padding: '4px 0',
                  },
                }}
              />

              <TextField
                {...register('username')}
                fullWidth
                label="Username *"
                error={!!errors.username}
                helperText={errors.username?.message}
                disabled={loading}
                size="small"
                sx={{
                  '& .MuiInputBase-root': {
                    padding: '4px 6px',
                  },
                  '& .MuiInputBase-input': {
                    padding: '4px 0',
                  },
                }}
              />

              <TextField
                {...register('email')}
                fullWidth
                label="Email *"
                type="email"
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={loading}
                size="small"
                sx={{
                  '& .MuiInputBase-root': {
                    padding: '4px 6px',
                  },
                  '& .MuiInputBase-input': {
                    padding: '4px 0',
                  },
                }}
              />

              <FormControl
                fullWidth
                error={!!errors.role}
                size="small"
                sx={{
                  '& .MuiInputBase-root': {
                    padding: '4px 6px',
                  },
                  '& .MuiSelect-select': {
                    padding: '4px 0',
                  },
                }}
              >
                <InputLabel>Perfil *</InputLabel>
                <Select
                  {...register('role')}
                  label="Perfil *"
                  disabled={loading}
                >
                  {Object.values(UserProfile).map(profile => (
                    <MenuItem key={profile} value={profile}>
                      {profile}
                    </MenuItem>
                  ))}
                </Select>
                {errors.role && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ mt: 0.5, ml: 1.75 }}
                  >
                    {errors.role.message}
                  </Typography>
                )}
              </FormControl>

              <TextField
                {...register('password')}
                fullWidth
                label={isEditing ? "Nova Senha (opcional)" : "Senha *"}
                type={showPassword ? 'text' : 'password'}
                error={!!errors.password}
                helperText={isEditing ? (errors.password?.message || "Deixe em branco para manter a senha atual") : errors.password?.message}
                disabled={loading}
                size="small"
                sx={{
                  '& .MuiInputBase-root': {
                    padding: '4px 6px',
                  },
                  '& .MuiInputBase-input': {
                    padding: '4px 0',
                  },
                }}
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
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
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

              <Box display="flex" gap={2} justifyContent="flex-end" mt={1}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/usuarios')}
                  disabled={loading}
                >
                  Fechar
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
