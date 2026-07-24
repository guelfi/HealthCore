import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import { formatDateBR } from '../../utils/dateUtils';
import {
  Person as UsuarioIcon,
  Visibility,
} from '@mui/icons-material';
import {
  standardCardStyles,
  standardCardContentStyles,
  standardDialogTitleStyles,
  standardDialogPaperStyles,
  standardDialogContentStyles,
} from '../../styles/cardStyles';
import { UserProfile } from '../../../domain/enums/UserProfile';
import type { Usuario, CreateUsuarioDto, UpdateUsuarioDto } from '../../../domain/entities/Usuario';
import { useUsuarios } from '../../hooks/useUsuarios';
import { useUIStore } from '../../../application/stores/uiStore';
import {
  DeleteConfirmationDialog,
  SuccessDialog,
} from '../../components/common/ConfirmationDialogs';
import StandardDialogButtons from '../../components/common/StandardDialogButtons';
import ResponsiveTableHeader from '../../../components/ui/Layout/ResponsiveTableHeader';
import CustomPagination from '../../components/common/CustomPagination';
import MobileOptimizedTable from '../../../components/ui/Table/MobileOptimizedTable';

const UsuariosPageTable: React.FC = () => {
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
  const [pageSize] = useState(10);

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
  const tableData = paginatedData.map(usuario => ({
    ...usuario,
    perfilLabel: profileLabels[usuario.role],
    createdAtFormatado: formatDateBR(usuario.createdAt) || 'N/A',
    updatedAtFormatado: formatDateBR(usuario.updatedAt) || 'N/A',
  }));

  const tableColumns = [
    {
      id: 'actions',
      label: '',
      minWidth: 44,
      width: 44,
      align: 'center' as const,
      mobileVisible: true,
      render: () => (
        <Visibility
          color="action"
          sx={{
            fontSize: '1.3rem',
            cursor: 'pointer',
            '&:hover': { color: 'primary.main' },
          }}
        />
      ),
    },
    {
      id: 'username',
      label: 'Nome',
      minWidth: 180,
      width: 210,
      mobileVisible: true,
      tabletVisible: true,
      desktopVisible: true,
    },
    {
      id: 'perfilLabel',
      label: 'Perfil',
      minWidth: 120,
      width: 130,
      mobileVisible: false,
      tabletVisible: true,
      desktopVisible: true,
    },
    {
      id: 'isActive',
      label: 'Status',
      minWidth: 82,
      width: 90,
      mobileVisible: true,
      tabletVisible: true,
      desktopVisible: true,
      render: (value: unknown) => (
        <Chip
          label={value ? 'Ativo' : 'Inativo'}
          color={value ? 'success' : 'error'}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      id: 'createdAtFormatado',
      label: 'Cadastrado',
      minWidth: 115,
      width: 120,
      mobileVisible: false,
      tabletVisible: true,
      desktopVisible: true,
    },
    {
      id: 'updatedAtFormatado',
      label: 'Atualizado',
      minWidth: 115,
      width: 120,
      mobileVisible: false,
      tabletVisible: true,
      desktopVisible: true,
    },
  ];

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
              <CustomPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={total}
                itemsPerPage={pageSize}
                onPageChange={handlePageChange}
                size="small"
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
              <MobileOptimizedTable
                columns={tableColumns}
                data={tableData}
                onRowClick={handleRowClick}
                loading={loading}
                emptyMessage="Nenhum usuário encontrado"
                rowHeight={36}
                minRows={10}
                stickyHeader
                touchOptimized
              />
            )}
        </CardContent>
      </Card>

      {/* Dialog de Manutenção */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth={false}
        sx={{
          '& .MuiDialog-paper': standardDialogPaperStyles,
        }}
      >
        <DialogTitle sx={standardDialogTitleStyles}>
          <UsuarioIcon />
          {dialogMode === 'add' ? 'Adicionar Usuário' : 'Editar Usuário'}
        </DialogTitle>

        <DialogContent sx={standardDialogContentStyles}>
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
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
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
