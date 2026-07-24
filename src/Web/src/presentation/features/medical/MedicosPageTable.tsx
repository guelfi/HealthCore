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
  InputAdornment,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Visibility,
  Person as PersonIcon,
} from '@mui/icons-material';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  standardCardStyles,
  standardCardContentStyles,
  standardDialogTitleStyles,
  standardDialogPaperStyles,
  standardDialogContentStyles,
} from '../../styles/cardStyles';
import { useMedicos } from '../../hooks/useMedicos';
import { useEspecialidadesForDropdown } from '../../hooks/useEspecialidadesForDropdown';
import type { Medico, CreateMedicoDto, UpdateMedicoDto } from '../../../domain/entities/Medico';
import NotificationService from '@/application/services/NotificationService';
import { useUIStore } from '../../../application/stores/uiStore';
import {
  formatCPF,
  applyCPFMask,
  applyPhoneMask,
  unformatCPF,
  unformatPhone,
} from '../../../utils/formatters';
import {
  DeleteConfirmationDialog,
  SuccessDialog,
  ErrorInfoDialog,
} from '../../components/common/ConfirmationDialogs';
import StandardDialogButtons from '../../components/common/StandardDialogButtons';
import ResponsiveTableHeader from '../../../components/ui/Layout/ResponsiveTableHeader';
import CustomPagination from '../../components/common/CustomPagination';
import MobileOptimizedTable from '../../../components/ui/Table/MobileOptimizedTable';
import { Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';

const MedicosPageTable: React.FC = () => {
  const { addNotification } = useUIStore();

  const {
    medicos,
    total,
    currentPage,
    totalPages,
    loading,
    error,
    fetchMedicos,
    createMedico,
    updateMedico,
    deleteMedico,
    clearError,
  } = useMedicos();

  const {
    especialidades,
    loading: especialidadesLoading,
  } = useEspecialidadesForDropdown();

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedMedico, setSelectedMedico] = useState<Medico | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [formData, setFormData] = useState({
    nome: '',
    documento: '',
    crm: '',
    especialidade: '',
    telefone: '',
    email: '',
    username: '',
    password: '',
    dataNascimento: new Date().toISOString().split('T')[0],
  });
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogReason, setErrorDialogReason] = useState<string | undefined>(undefined);

  // Notificações via serviço reutilizável

  // Carregar médicos ao montar o componente
  useEffect(() => {
    fetchMedicos({ page, pageSize });
  }, [fetchMedicos, page, pageSize]);

  const handleRowClick = (medico: Medico) => {
    setSelectedMedico(medico);
    setFormData({
      nome: medico.nome,
      documento: applyCPFMask(medico.documento),
      crm: medico.crm,
      especialidade: medico.especialidade || '',
      telefone: medico.telefone ? applyPhoneMask(medico.telefone) : '',
      email: medico.email || '',
      username: medico.username || '',
      password: '', // Não preencher senha na edição
      dataNascimento: medico.dataNascimento ? new Date(medico.dataNascimento).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    });
    setDialogMode('edit');
    setOpenDialog(true);
  };

  const handleAddNew = () => {
    setSelectedMedico(null);
    setFormData({
      nome: '',
      documento: '',
      crm: '',
      especialidade: '',
      telefone: '',
      email: '',
      username: '',
      password: '',
      dataNascimento: new Date().toISOString().split('T')[0],
    });
    setDialogMode('add');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMedico(null);
    clearError();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (dialogMode === 'add') {
        const createData: CreateMedicoDto = {
          ...formData,
          documento: unformatCPF(formData.documento),
          telefone: unformatPhone(formData.telefone),
          dataNascimento: new Date(formData.dataNascimento),
        };
        await createMedico(createData);
        setSuccessMessage('Médico adicionado com sucesso!');
      } else if (selectedMedico) {
        const updateData: UpdateMedicoDto = {
          nome: formData.nome,
          documento: unformatCPF(formData.documento),
          crm: formData.crm,
          especialidade: formData.especialidade,
          telefone: unformatPhone(formData.telefone),
          email: formData.email,
          dataNascimento: new Date(formData.dataNascimento),
        };
        await updateMedico(selectedMedico.id, updateData);
        setSuccessMessage('Médico atualizado com sucesso!');
      }
      handleCloseDialog();
      setSuccessDialogOpen(true);
      // Recarregar a lista
      await fetchMedicos({ page, pageSize });
    } catch (error) {
      console.error('Erro ao salvar médico:', error);
      addNotification(
        `Erro ao ${dialogMode === 'add' ? 'adicionar' : 'atualizar'} médico. Tente novamente.`,
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedMedico) {
      setSaving(true);
      try {
        await deleteMedico(selectedMedico.id);
        setDeleteDialogOpen(false);
        handleCloseDialog();
        setSuccessMessage('Médico excluído com sucesso!');
        setSuccessDialogOpen(true);
        // Toast de sucesso contextual (top-right, suave)
        NotificationService.success('Médico excluído com sucesso.', {
          duration: 5000,
          position: { vertical: 'top', horizontal: 'right' },
          ariaLive: 'polite',
        });
        // Recarregar a lista
        await fetchMedicos({ page, pageSize });
      } catch (error) {
        console.error('Erro ao deletar médico:', error);
        const specificMessage =
          error instanceof Error ? error.message : 'Erro ao excluir medico';
        setErrorDialogReason(specificMessage);
        setErrorDialogOpen(true);
        // Toast complementar com mensagens contextualizadas e ação de retry
        // Mapeamento de erro e toast consistente no topo-direita
        const errorResponse = error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { status?: number; data?: { message?: string } } }).response
          : undefined;
        const status = errorResponse?.status;
        const msg = errorResponse?.data?.message || specificMessage;
        if (status === 409 || /vinculad|associad|relacionament/i.test(msg)) {
          NotificationService.medicoDeleteBlocked();
        } else {
          NotificationService.handleApiError(error, {
            entity: 'medico',
            retry: () => handleDeleteConfirm(),
          });
        }
      } finally {
        setSaving(false);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    if (field === 'documento') {
      formattedValue = applyCPFMask(value);
    } else if (field === 'telefone') {
      formattedValue = applyPhoneMask(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchMedicos({ page: newPage, pageSize });
  };

  // Os dados já vêm paginados da API
  const paginatedData = medicos;
  const tableData = paginatedData.map(medico => ({
    ...medico,
    documentoFormatado: formatCPF(medico.documento),
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
      id: 'nome',
      label: 'Nome Médico',
      minWidth: 170,
      width: 185,
      mobileVisible: true,
      tabletVisible: true,
      desktopVisible: true,
    },
    {
      id: 'crm',
      label: 'CRM',
      minWidth: 120,
      width: 130,
      mobileVisible: false,
      tabletVisible: true,
      desktopVisible: true,
    },
    {
      id: 'especialidade',
      label: 'Especialidade',
      minWidth: 145,
      width: 155,
      mobileVisible: true,
      tabletVisible: true,
      desktopVisible: true,
    },
    {
      id: 'documentoFormatado',
      label: 'Documento',
      minWidth: 130,
      width: 140,
      mobileVisible: false,
      tabletVisible: true,
      desktopVisible: true,
    },
    {
      id: 'isActive',
      label: 'Status',
      minWidth: 82,
      width: 90,
      mobileVisible: false,
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
  ];

  return (
    <Box>
      {/* Título e Descrição */}
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestão de Médicos
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ display: { xs: 'none', md: 'block' } }}
        >
          Cadastro e manutenção de médicos do sistema
        </Typography>
      </Box>

      {/* Card Principal */}
      <Card sx={standardCardStyles}>
        <CardContent sx={standardCardContentStyles}>
          {/* Header Responsivo com FAB Mobile */}
          <ResponsiveTableHeader
            onAddClick={handleAddNew}
            addButtonText="Adicionar Médico"
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
            itemName="médicos"
            showTotalOnMobile={false}
            fabTooltip="Adicionar Médico"
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
              emptyMessage="Nenhum médico encontrado"
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
          <PersonIcon />
          {dialogMode === 'add' ? 'Adicionar Médico' : 'Editar Médico'}
        </DialogTitle>

        <DialogContent sx={standardDialogContentStyles}>
          <Box
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2.625 }}
          >
            <TextField
              fullWidth
              label="Nome Completo"
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              variant="outlined"
              size="small"
              required
              sx={{
                '& .MuiInputBase-root': {
                  padding: '4px 6px',
                },
                '& .MuiInputBase-input': {
                  padding: '4px 0',
                },
              }}
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Documento (CPF)"
                value={formData.documento}
                onChange={(e) => handleInputChange('documento', e.target.value)}
                variant="outlined"
                size="small"
                required
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
                fullWidth
                label="CRM"
                value={formData.crm}
                onChange={(e) => handleInputChange('crm', e.target.value)}
                variant="outlined"
                size="small"
                required
                sx={{
                  '& .MuiInputBase-root': {
                    padding: '4px 6px',
                  },
                  '& .MuiInputBase-input': {
                    padding: '4px 0',
                  },
                }}
              />
            </Box>
            <FormControl
              fullWidth
              size="small"
              required
              sx={{
                '& .MuiInputBase-root': {
                  padding: '4px 6px',
                },
                '& .MuiInputBase-input': {
                  padding: '4px 0',
                },
              }}
            >
              <InputLabel>Especialidade</InputLabel>
              <Select
                value={formData.especialidade}
                onChange={(e) => handleInputChange('especialidade', e.target.value)}
                label="Especialidade"
                disabled={especialidadesLoading}
              >
                <MenuItem value="">
                  <em>Selecione uma especialidade</em>
                </MenuItem>
                {especialidades.map((especialidade) => (
                  <MenuItem key={especialidade.id} value={especialidade.nome}>
                    {especialidade.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Telefone"
                value={formData.telefone}
                onChange={(e) => handleInputChange('telefone', e.target.value)}
                variant="outlined"
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
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                variant="outlined"
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
            </Box>
            <TextField
              fullWidth
              label="Username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              variant="outlined"
              size="small"
              required
              disabled={dialogMode === 'edit'}
              helperText={dialogMode === 'edit' ? 'Username não pode ser alterado' : ''}
              sx={{
                '& .MuiInputBase-root': {
                  padding: '4px 6px',
                },
                '& .MuiInputBase-input': {
                  padding: '4px 0',
                },
              }}
            />
            {dialogMode === 'add' && (
              <TextField
                fullWidth
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                variant="outlined"
                size="small"
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                        onClick={() => setShowPassword(prev => !prev)}
                        edge="end"
                        size="small"
                        sx={{
                          color: showPassword ? 'primary.main' : 'text.secondary',
                          '&:hover': { color: 'primary.main' },
                          transition: 'color 0.2s ease',
                        }}
                      >
                        {showPassword ? (
                          <VisibilityOffIcon fontSize="small" />
                        ) : (
                          <VisibilityIcon fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiInputBase-root': {
                    padding: '4px 6px',
                  },
                  '& .MuiInputBase-input': {
                    padding: '4px 0',
                  },
                }}
              />
            )}
            {selectedMedico && (
              <Box
                sx={{
                  display: 'flex',
                  gap: 0.5,
                  flexWrap: 'wrap',
                  mt: 0.5,
                }}
              >
                <Chip
                  label={`ID: ${selectedMedico.id}`}
                  variant="outlined"
                  size="small"
                  sx={{ fontSize: '0.65rem', height: '20px' }}
                />
                <Chip
                  label={`CRM: ${selectedMedico.crm}`}
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

      {/* Diálogo de Confirmação de Exclusão */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        onClose={handleDeleteCancel}
        itemName={selectedMedico?.nome || ''}
        itemType="médico"
      />

      {/* Diálogo de Sucesso */}
      <SuccessDialog
        open={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
        title="Sucesso!"
        message={successMessage}
      />

      {/* Diálogo de Erro Contextual */}
      <ErrorInfoDialog
        open={errorDialogOpen}
        onClose={() => setErrorDialogOpen(false)}
        title="Não foi possível excluir"
        reason={errorDialogReason}
        actions={[
          {
            label: 'Ver pacientes associados',
            onClick: () => {
              // Navegar para pacientes
              window.location.href = '/pacientes';
            },
          },
        ]}
      />
    </Box>
  );
};

export default MedicosPageTable;
