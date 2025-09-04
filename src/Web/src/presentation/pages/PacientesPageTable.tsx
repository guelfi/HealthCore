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
  Close,
} from '@mui/icons-material';
import {
  standardCardStyles,
  standardCardContentStyles,
  standardDialogButtonStyles,
  standardDialogActionsStyles,
  standardDialogTitleStyles,
  standardAddButtonStyles,
} from '../styles/cardStyles';
import type { Paciente } from '../../domain/entities/Paciente';
import { usePacientes } from '../hooks/usePacientes';
import { useUIStore } from '../../application/stores/uiStore';

import {
  formatCPF,
  formatPhone,
  formatDateBR,
  applyCPFMask,
  applyPhoneMask,
  unformatCPF,
  unformatPhone,
} from '../../utils/formatters';
import {
  DeleteConfirmationDialog,
  SuccessDialog,
} from '../components/common/ConfirmationDialogs';
import StandardDialogButtons from '../components/common/StandardDialogButtons';
import CustomPagination from '../components/common/CustomPagination';

const PacientesPageTable: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { addNotification } = useUIStore();

  const {
    pacientes,
    loading,
    error,
    total,
    currentPage,
    fetchPacientes,
    createPaciente,
    updatePaciente,
    deletePaciente,
  } = usePacientes();

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(7);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Estados do formulário
  const [formData, setFormData] = useState({
    nome: '',
    documento: '',
    dataNascimento: '',
    telefone: '',
    email: '',
    endereco: '',
  });

  // Carregar pacientes ao montar o componente
  useEffect(() => {
    fetchPacientes({ page, pageSize });
  }, [fetchPacientes, page, pageSize]);

  const handleRowClick = (paciente: Paciente) => {
    setSelectedPaciente(paciente);
    setFormData({
      nome: paciente.nome,
      documento: formatCPF(paciente.documento), // Aplicar máscara do CPF
      dataNascimento: paciente.dataNascimento
        ? new Date(paciente.dataNascimento).toISOString().split('T')[0]
        : '',
      telefone: paciente.telefone ? formatPhone(paciente.telefone) : '', // Aplicar máscara do telefone
      email: paciente.email || '',
      endereco: paciente.endereco || '',
    });
    setDialogMode('edit');
    setOpenDialog(true);
  };

  const handleAddNew = () => {
    setSelectedPaciente(null);
    setFormData({
      nome: '',
      documento: '',
      dataNascimento: '',
      telefone: '',
      email: '',
      endereco: '',
    });
    setDialogMode('add');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPaciente(null);
    setSaving(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const pacienteData = {
        nome: formData.nome,
        documento: unformatCPF(formData.documento), // Remove máscara do CPF
        dataNascimento: new Date(formData.dataNascimento),
        telefone: formData.telefone ? unformatPhone(formData.telefone) : '', // Remove máscara do telefone
        email: formData.email,
        endereco: formData.endereco,
      };

      if (dialogMode === 'add') {
        await createPaciente(pacienteData);
        setSuccessMessage(`Paciente "${formData.nome}" foi criado com sucesso.`);
      } else if (selectedPaciente) {
        await updatePaciente(selectedPaciente.id, pacienteData);
        setSuccessMessage(`Paciente "${formData.nome}" foi atualizado com sucesso.`);
      }

      handleCloseDialog();
      setSuccessDialogOpen(true);
      fetchPacientes({ page, pageSize }); // Recarregar lista
    } catch (error: any) {
      addNotification(error.message || 'Erro ao salvar paciente', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPaciente) return;

    try {
      await deletePaciente(selectedPaciente.id);
      setSuccessMessage(`Paciente "${selectedPaciente.nome}" foi excluído com sucesso.`);
      setDeleteDialogOpen(false);
      handleCloseDialog(); // Fechar o dialog principal de edição
      setSuccessDialogOpen(true);
      fetchPacientes({ page, pageSize }); // Recarregar lista
    } catch (error: any) {
      addNotification(error.message || 'Erro ao excluir paciente', 'error');
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Aplicar máscaras durante a digitação
  const handleDocumentoChange = (value: string) => {
    const maskedValue = applyCPFMask(value);
    handleInputChange('documento', maskedValue);
  };

  const handleTelefoneChange = (value: string) => {
    const maskedValue = applyPhoneMask(value);
    handleInputChange('telefone', maskedValue);
  };

  return (
    <>
      {/* Título e Descrição */}
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestão de Pacientes
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ display: { xs: 'none', md: 'block' } }}
        >
          Cadastro e manutenção de pacientes
        </Typography>
      </Box>

      {/* Mensagem de erro */}
      {error && (
        <Box sx={{ mb: 2 }}>
          <Typography color="error" variant="body2">
            Erro: {error}
          </Typography>
        </Box>
      )}

      {/* Card Principal */}
      <Card sx={standardCardStyles}>
        <CardContent sx={standardCardContentStyles}>
          {/* Cabeçalho do Grid */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNew}
              size={isMobile ? 'small' : 'medium'}
              sx={standardAddButtonStyles}
            >
              Adicionar Paciente
            </Button>

            <CustomPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={total}
              itemsPerPage={pageSize}
              onPageChange={handlePageChange}
              size="small"
            />
          </Box>

          {/* Estado de carregamento */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <Typography>Carregando pacientes...</Typography>
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
                    <TableCell>
                      <strong>Documento</strong>
                    </TableCell>
                    <TableCell
                      sx={{ display: { xs: 'none', md: 'table-cell' } }}
                    >
                      <strong>Data de Nascimento</strong>
                    </TableCell>
                    <TableCell
                      sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                    >
                      <strong>Telefone</strong>
                    </TableCell>
                    <TableCell
                      sx={{ display: { xs: 'none', md: 'table-cell' } }}
                    >
                      <strong>E-mail</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pacientes.map(paciente => (
                    <TableRow
                      key={paciente.id}
                      onClick={() => handleRowClick(paciente)}
                      sx={{
                        cursor: 'pointer',
                        height: 31,
                        '&:hover': {
                          backgroundColor: 'rgba(102, 126, 234, 0.04)',
                        },
                      }}
                    >
                      <TableCell align="center">
                        <Visibility
                          color="action"
                          sx={{
                            fontSize: '1.1rem',
                            cursor: 'pointer',
                            '&:hover': { color: 'primary.main' },
                          }}
                        />
                      </TableCell>
                      <TableCell>{paciente.nome}</TableCell>
                      <TableCell>
                        {formatCPF(paciente.documento)}
                      </TableCell>
                      <TableCell
                        sx={{
                          display: { xs: 'none', md: 'table-cell' },
                        }}
                      >
                        {formatDateBR(paciente.dataNascimento)}
                      </TableCell>
                      <TableCell
                        sx={{
                          display: { xs: 'none', sm: 'table-cell' },
                        }}
                      >
                        {formatPhone(paciente.telefone || '')}
                      </TableCell>
                      <TableCell
                        sx={{
                          display: { xs: 'none', md: 'table-cell' },
                        }}
                      >
                        {paciente.email || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                  {pacientes.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography
                          variant="body1"
                          color="text.secondary"
                          sx={{ py: 4 }}
                        >
                          Nenhum paciente encontrado
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
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
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            width: { xs: '95vw', sm: '600px' },
            maxWidth: '600px',
            margin: { xs: 1, sm: 3 },
          },
        }}
      >
        <DialogTitle sx={standardDialogTitleStyles}>
          <PersonIcon />
          {dialogMode === 'add' ? 'Adicionar Paciente' : 'Editar Paciente'}
        </DialogTitle>

        <DialogContent sx={{ pt: 1.625, px: 1.5, pb: 1 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: { xs: 1, sm: 1.2 },
              mt: 2.25,
            }}
          >
            <TextField
              fullWidth
              label="Nome *"
              value={formData.nome}
              onChange={e => handleInputChange('nome', e.target.value)}
              disabled={saving}
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

            <Box sx={{ display: 'flex', gap: { xs: 1, sm: 1.5 } }}>
              <TextField
                fullWidth
                label="Documento (CPF) *"
                value={formData.documento}
                onChange={e => handleDocumentoChange(e.target.value)}
                disabled={saving}
                inputProps={{ maxLength: 14 }}
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
                label="Data de Nascimento *"
                type="date"
                value={formData.dataNascimento}
                onChange={e =>
                  handleInputChange('dataNascimento', e.target.value)
                }
                InputLabelProps={{ shrink: true }}
                disabled={saving}
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

            <Box sx={{ display: 'flex', gap: { xs: 1, sm: 1.5 } }}>
              <TextField
                fullWidth
                label="Telefone"
                value={formData.telefone}
                onChange={e => handleTelefoneChange(e.target.value)}
                disabled={saving}
                inputProps={{ maxLength: 15 }}
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
                label="E-mail"
                type="email"
                value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)}
                disabled={saving}
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
              label="Endereço"
              multiline
              rows={2}
              value={formData.endereco}
              onChange={e => handleInputChange('endereco', e.target.value)}
              disabled={saving}
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
        </DialogContent>

        <StandardDialogButtons
           onSave={handleSave}
           onClose={handleCloseDialog}
           onDelete={dialogMode === 'edit' ? () => setDeleteDialogOpen(true) : undefined}
           showDelete={dialogMode === 'edit'}
           saveLoading={saving}
           saveText={dialogMode === 'add' ? 'Adicionar' : 'Salvar'}
         />
      </Dialog>

      {/* Diálogo de Confirmação de Exclusão */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        itemName={selectedPaciente?.nome || ''}
        itemType="paciente"
        loading={saving}
      />

      {/* Diálogo de Sucesso */}
      <SuccessDialog
        open={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
        title="Sucesso!"
        message={successMessage}
      />
    </>
  );
};

export default PacientesPageTable;
