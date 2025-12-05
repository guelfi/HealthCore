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
  InputAdornment,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Pagination,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility,
  Person as PersonIcon,
  Save,
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
  standardDialogButtonStyles,
  standardDialogActionsStyles,
  standardDialogTitleStyles,
  standardAddButtonStyles,
} from '../styles/cardStyles';
import { useMedicos } from '../hooks/useMedicos';
import { useEspecialidadesForDropdown } from '../hooks/useEspecialidadesForDropdown';
import type { Medico, CreateMedicoDto, UpdateMedicoDto } from '../../domain/entities/Medico';
import NotificationService from '@/application/services/NotificationService';
import {
  formatCPF,
  applyCPFMask,
  applyPhoneMask,
  unformatCPF,
  unformatPhone,
} from '../../utils/formatters';
import {
  DeleteConfirmationDialog,
  SuccessDialog,
  ErrorInfoDialog,
} from '../components/common/ConfirmationDialogs';
import StandardDialogButtons from '../components/common/StandardDialogButtons';
import ResponsiveTableHeader from '../../components/ui/Layout/ResponsiveTableHeader';
import { Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';

const MedicosPageTable: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
    error: especialidadesError,
  } = useEspecialidadesForDropdown();

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedMedico, setSelectedMedico] = useState<Medico | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(7);
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
          (error as any)?.message || 'Erro ao excluir médico';
        setErrorDialogReason(specificMessage);
        setErrorDialogOpen(true);
        // Toast complementar com mensagens contextualizadas e ação de retry
        // Mapeamento de erro e toast consistente no topo-direita
        const status = (error as any)?.response?.status;
        const msg = (error as any)?.response?.data?.message || specificMessage;
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
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(_, newPage) => handlePageChange(newPage)}
                size="small"
                color="primary"
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
                    <strong>Nome Médico</strong>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <strong>CRM</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Especialidade</strong>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    <strong>Documento</strong>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <strong>Status</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map(medico => (
                  <TableRow
                    key={medico.id}
                    onClick={() => handleRowClick(medico)}
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
                          fontSize: '1.1rem',
                          cursor: 'pointer',
                          '&:hover': { color: 'primary.main' },
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: '1px' }}>{medico.nome}</TableCell>
                    <TableCell
                      sx={{ display: { xs: 'none', md: 'table-cell' }, py: '1px' }}
                    >
                      {medico.crm}
                    </TableCell>
                    <TableCell sx={{ py: '1px' }}>{medico.especialidade}</TableCell>
                    <TableCell
                      sx={{ display: { xs: 'none', sm: 'table-cell' }, py: '1px' }}
                    >
                      {formatCPF(medico.documento)}
                    </TableCell>
                    <TableCell
                      sx={{ display: { xs: 'none', md: 'table-cell' }, py: '1px' }}
                    >
                      <Chip
                        label={medico.isActive ? 'Ativo' : 'Inativo'}
                        color={medico.isActive ? 'success' : 'error'}
                        size="small"
                        variant="outlined"
                      />
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
            width: { xs: '95vw', sm: '550px' },
            maxWidth: '550px',
            margin: { xs: 1, sm: 3 },
            maxHeight: { xs: '95vh', sm: '90vh' },
            minHeight: { xs: 'auto', sm: 'auto' },
          },
        }}
      >
        <DialogTitle sx={standardDialogTitleStyles}>
          <PersonIcon />
          {dialogMode === 'add' ? 'Adicionar Médico' : 'Editar Médico'}
        </DialogTitle>

        <DialogContent sx={{ pt: 4.625, px: 3, pb: 2, overflow: 'auto' }}>
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
            <Box sx={{ display: 'flex', gap: { xs: 1, sm: 1.5 } }}>
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
            <Box sx={{ display: 'flex', gap: { xs: 1, sm: 1.5 } }}>
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
