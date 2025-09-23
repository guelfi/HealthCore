import React, { useState, useEffect } from 'react';
import {
  useTheme,
  useMediaQuery,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { formatDateBR } from '../utils/dateUtils';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as UsuarioIcon,
  Visibility,
  Save,
} from '@mui/icons-material';
import {
  standardCardStyles,
  standardCardContentStyles,
  standardDialogButtonStyles,
  standardDialogActionsStyles,
  standardDialogTitleStyles,
  standardAddButtonStyles,
} from '../styles/cardStyles';
import { UserProfile } from '../../domain/enums/UserProfile';
import type { Usuario, CreateUsuarioDto, UpdateUsuarioDto } from '../../domain/entities/Usuario';
import { useUsuarios } from '../hooks/useUsuarios';
import { useUIStore } from '../../application/stores/uiStore';
import {
  DeleteConfirmationDialog,
  SuccessDialog,
} from '../components/common/ConfirmationDialogs';
import StandardDialogButtons from '../components/common/StandardDialogButtons';
import ResponsiveTableHeader from '../../components/ui/Layout/ResponsiveTableHeader';

const UsuariosPageTable: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { addNotification } = useUIStore();
  
  const {
    usuarios,
    total,
    currentPage,
    totalPages,
    loading,
    error,
    fetchUsuarios,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    // activateUsuario,
    // deactivateUsuario,
    clearError,
  } = useUsuarios();

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: UserProfile.MEDICO,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [pageSize] = useState(7);

  const profileLabels = {
    [UserProfile.ADMINISTRADOR]: 'Administrador',
    [UserProfile.MEDICO]: 'Médico',
  };

  // Carregar usuários ao montar o componente
  useEffect(() => {
    fetchUsuarios({ page: currentPage, pageSize });
  }, [currentPage, pageSize, fetchUsuarios]);

  // Resetar form data quando o dialog abrir
  useEffect(() => {
    if (openDialog) {
      if (dialogMode === 'add') {
        setFormData({
          username: '',
          password: '',
          role: UserProfile.MEDICO,
          isActive: true,
        });
      } else if (selectedUsuario) {
        setFormData({
          username: selectedUsuario.username,
          password: '',
          role: selectedUsuario.role,
          isActive: selectedUsuario.isActive,
        });
      }
    }
  }, [openDialog, dialogMode, selectedUsuario]);

  const handleRowClick = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setDialogMode('edit');
    setOpenDialog(true);
  };

  const handleAddNew = () => {
    setSelectedUsuario(null);
    setDialogMode('add');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUsuario(null);
  };

  const handleSave = async () => {
    if (!formData.username || (dialogMode === 'add' && !formData.password)) {
      addNotification('Preencha todos os campos obrigatórios', 'error');
      return;
    }

    setSaving(true);
    try {
      if (dialogMode === 'add') {
        const createData: CreateUsuarioDto = {
          username: formData.username,
          password: formData.password,
          role: formData.role,
        };
        await createUsuario(createData);
        setSuccessMessage('Usuário criado com sucesso!');
      } else if (selectedUsuario) {
        const updateData: UpdateUsuarioDto = {
          username: formData.username,
          role: formData.role,
          isActive: formData.isActive,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await updateUsuario(selectedUsuario.id, updateData);
        setSuccessMessage('Usuário atualizado com sucesso!');
      }
      
      handleCloseDialog();
      setSuccessDialogOpen(true);
      await fetchUsuarios({ page: currentPage, pageSize });
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      addNotification('Erro ao salvar usuário', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUsuario) return;

    try {
      await deleteUsuario(selectedUsuario.id);
      setDeleteDialogOpen(false);
      handleCloseDialog();
      setSuccessMessage('Usuário excluído com sucesso!');
      setSuccessDialogOpen(true);
      await fetchUsuarios({ page: currentPage, pageSize });
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      addNotification('Erro ao excluir usuário', 'error');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handlePageChange = async (newPage: number) => {
    await fetchUsuarios({ page: newPage, pageSize });
  };

  // const handleToggleActive = async (usuario: Usuario) => {
  //   try {
  //     if (usuario.isActive) {
  //       await deactivateUsuario(usuario.id);
  //       setSuccessMessage('Usuário desativado com sucesso!');
  //     } else {
  //       await activateUsuario(usuario.id);
  //       setSuccessMessage('Usuário ativado com sucesso!');
  //     }
  //     setSuccessDialogOpen(true);
  //     await fetchUsuarios({ page: currentPage, pageSize });
  //   } catch (error) {
  //     console.error('Erro ao alterar status do usuário:', error);
  //     addNotification('Erro ao alterar status do usuário', 'error');
  //   }
  // };

  const paginatedData = usuarios;

  return (
    <Box>
      {/* Título e Descrição */}
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestão de Usuários
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ display: { xs: 'none', md: 'block' } }}
        >
          Administração de usuários e perfis do sistema
        </Typography>
      </Box>

      {/* Card Principal */}
      <Card sx={standardCardStyles}>
        <CardContent sx={standardCardContentStyles}>
          {/* Header Responsivo com FAB Mobile */}
          <ResponsiveTableHeader
            onAddClick={handleAddNew}
            addButtonText="Adicionar Usuário"
            addButtonDisabled={loading || saving}
            paginationComponent={
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(_, newPage) => handlePageChange(newPage)}
                size="small"
                color="primary"
              />
            }
            totalItems={total}
            itemName="usuários"
            showTotalOnMobile={false}
            fabTooltip="Adicionar Usuário"
          />

          {/* Mensagem de Erro */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
              {error}
            </Alert>
          )}

          {/* Loading */}
           {loading && (
             <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
               <CircularProgress />
             </Box>
           )}

            {/* Tabela de Dados */}
            {!loading && (
          <TableContainer
            component={Paper}
            sx={{
              boxShadow: 'none',
              border: '1px solid',
              borderColor: 'divider',
              maxHeight: 450,
            }}
          >
            <Table size="small">
              <TableHead sx={{ backgroundColor: 'rgba(102, 126, 234, 0.1)' }}>
                <TableRow>
                  <TableCell align="center" sx={{ width: 50 }}></TableCell>
                  <TableCell>
                    <strong>Nome</strong>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <strong>Perfil</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Status</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Cadastrado</strong>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <strong>Atualizado</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map(usuario => (
                  <TableRow
                    key={usuario.id}
                    onClick={() => handleRowClick(usuario)}
                    sx={{
                      cursor: 'pointer',
                      height: 31,
                      '&:hover': {
                        backgroundColor: 'rgba(102, 126, 234, 0.04)',
                      },
                    }}
                  >
                    <TableCell align="center" sx={{ py: '1px' }}>
                      <Visibility
                        color="action"
                        sx={{
                          fontSize: '1.2rem',
                          cursor: 'pointer',
                          '&:hover': { color: 'primary.main' },
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: '1px' }}>{usuario.username}</TableCell>
                    <TableCell
                      sx={{ display: { xs: 'none', md: 'table-cell' }, py: '1px' }}
                    >
                      {profileLabels[usuario.role]}
                    </TableCell>
                    <TableCell sx={{ py: '1px' }}>
                      <Chip
                        label={usuario.isActive ? 'Ativo' : 'Inativo'}
                        color={usuario.isActive ? 'success' : 'error'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell sx={{ py: '1px' }}>
                      {formatDateBR(usuario.createdAt) || 'N/A'}
                    </TableCell>
                    <TableCell
                      sx={{ display: { xs: 'none', md: 'table-cell' }, py: '1px' }}
                    >
                      {formatDateBR(usuario.updatedAt) || 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
            )}
        </CardContent>
      </Card>

      {/* Dialog de Manutenção */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth={false}
        sx={{
          '& .MuiDialog-paper': {
            width: { xs: '95vw', sm: '500px' },
            maxWidth: '500px',
            margin: { xs: 1, sm: 3 },
            minHeight: { xs: 'auto', sm: 'auto' },
          },
        }}
      >
        <DialogTitle sx={standardDialogTitleStyles}>
          <UsuarioIcon />
          {dialogMode === 'add' ? 'Adicionar Usuário' : 'Editar Usuário'}
        </DialogTitle>

        <DialogContent
          sx={{
            pt: 4,
            px: 3,
            pb: 2,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Nome de Usuário"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              variant="outlined"
              size="small"
            />
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Perfil</InputLabel>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserProfile })}
                label="Perfil"
              >
                <MenuItem value={UserProfile.ADMINISTRADOR}>
                  {profileLabels[UserProfile.ADMINISTRADOR]}
                </MenuItem>
                <MenuItem value={UserProfile.MEDICO}>
                  {profileLabels[UserProfile.MEDICO]}
                </MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                label="Status"
              >
                <MenuItem value="true">Ativo</MenuItem>
                <MenuItem value="false">Inativo</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                label="Senha"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                variant="outlined"
                size="small"
                placeholder={
                  dialogMode === 'edit'
                    ? 'Deixe em branco para manter atual'
                    : ''
                }
              />
              <TextField
                fullWidth
                label="Confirmar Senha"
                type="password"
                variant="outlined"
                size="small"
              />
            </Box>
            {selectedUsuario && (
              <Box
                sx={{
                  display: 'flex',
                  gap: 0.5,
                  flexWrap: 'wrap',
                  mt: 0.5,
                }}
              >
                <Chip
                  label={`ID: ${selectedUsuario.id}`}
                  variant="outlined"
                  size="small"
                  sx={{ fontSize: '0.65rem', height: '20px' }}
                />
                <Chip
                  label={`Perfil: ${profileLabels[selectedUsuario.role]}`}
                  color="primary"
                  variant="outlined"
                  size="small"
                  sx={{ fontSize: '0.65rem', height: '20px' }}
                />
                <Chip
                  label={`Cadastrado: ${formatDateBR(selectedUsuario.createdAt) || 'N/A'}`}
                  variant="outlined"
                  size="small"
                  sx={{ fontSize: '0.65rem', height: '20px' }}
                />
                <Chip
                  label={`Atualizado: ${formatDateBR(selectedUsuario.updatedAt) || 'N/A'}`}
                  variant="outlined"
                  size="small"
                  sx={{ fontSize: '0.65rem', height: '20px' }}
                />
                <Chip
                  label={selectedUsuario.isActive ? 'Ativo' : 'Inativo'}
                  color={selectedUsuario.isActive ? 'success' : 'error'}
                  variant="outlined"
                  size="small"
                  sx={{ fontSize: '0.65rem', height: '20px' }}
                />
              </Box>
            )}
          </Box>
        </DialogContent>

        <StandardDialogButtons
          onSave={handleSave}
          onClose={handleCloseDialog}
          onDelete={dialogMode === 'edit' ? handleDeleteClick : undefined}
          showDelete={dialogMode === 'edit'}
          saveLoading={saving}
          saveText={dialogMode === 'add' ? 'Adicionar' : 'Salvar'}
        />
      </Dialog>

      {/* Dialogs de Confirmação */}
      <DeleteConfirmationDialog
         open={deleteDialogOpen}
         onClose={handleDeleteCancel}
         onConfirm={handleDeleteConfirm}
         itemName={selectedUsuario?.username || ''}
         itemType="usuário"
         loading={saving}
       />

      <SuccessDialog
         open={successDialogOpen}
         onClose={() => setSuccessDialogOpen(false)}
         title="Sucesso!"
         message={successMessage}
       />
    </Box>
  );
};

export default UsuariosPageTable;
