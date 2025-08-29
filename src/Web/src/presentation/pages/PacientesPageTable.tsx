import React, { useState } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import type { Paciente } from '../../domain/entities/Paciente';
import { usePacientes } from '../hooks/usePacientes';
import { useUIStore } from '../../application/stores/uiStore';
import { useAutoDebugger } from '../../utils/AutoDebugger';
import {
  formatCPF,
  formatPhone,
  formatDateBR,
  applyCPFMask,
  applyPhoneMask,
  unformatCPF,
  unformatPhone
} from '../../utils/formatters';
import {
  DeleteConfirmationDialog,
  SuccessDialog
} from '../components/common/ConfirmationDialogs';

const PacientesPageTable: React.FC = () => {
  const debug = useAutoDebugger('PacientesPageTable');
  debug.info('Componente inicializado!');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { addNotification } = useUIStore();

  const {
    pacientes,
    loading,
    error,
    total,
    currentPage,
    totalPages: totalPagesFromHook,
    fetchPacientes,
    createPaciente,
    updatePaciente,
    deletePaciente
  } = usePacientes();

  debug.debug('Hook usePacientes inicializado:', {
    pacientes: pacientes.length,
    loading,
    error
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [pageSize] = useState(10);
  const [saving, setSaving] = useState(false);

  // Estados para diálogos de confirmação
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: '', message: '' });

  // Estados do formulário
  const [formData, setFormData] = useState({
    nome: '',
    documento: '',
    dataNascimento: '',
    telefone: '',
    email: '',
    endereco: ''
  });

  // Monitorar mudanças nos pacientes
  React.useEffect(() => {
    debug.info('Pacientes atualizados:', {
      quantidade: pacientes.length,
      loading,
      error,
      primeiroPaciente: pacientes[0]?.nome || 'nenhum',
      estruturaPrimeiroPaciente: pacientes[0] ? {
        id: pacientes[0].id,
        nome: pacientes[0].nome,
        documento: pacientes[0].documento,
        dataNascimento: pacientes[0].dataNascimento,
        telefone: pacientes[0].telefone,
        email: pacientes[0].email,
        createdAt: pacientes[0].createdAt,
        todasAsPropriedades: Object.keys(pacientes[0])
      } : null
    });
  }, [pacientes, loading, error]);

  // Forçar carregamento inicial
  React.useEffect(() => {
    debug.info('Disparando fetchPacientes inicial...');
    fetchPacientes({ page: 1, pageSize: 10 });
  }, [fetchPacientes]);

  const handleRowClick = (paciente: Paciente) => {
    setSelectedPaciente(paciente);
    setFormData({
      nome: paciente.nome,
      documento: formatCPF(paciente.documento), // Aplicar máscara do CPF
      dataNascimento: paciente.dataNascimento ? new Date(paciente.dataNascimento).toISOString().split('T')[0] : '',
      telefone: paciente.telefone ? formatPhone(paciente.telefone) : '', // Aplicar máscara do telefone
      email: paciente.email || '',
      endereco: paciente.endereco || ''
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
      endereco: ''
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
      debug.info('Salvando paciente:', { dialogMode, formData });

      const pacienteData = {
        nome: formData.nome,
        documento: unformatCPF(formData.documento), // Remove máscara do CPF
        dataNascimento: new Date(formData.dataNascimento),
        telefone: formData.telefone ? unformatPhone(formData.telefone) : '', // Remove máscara do telefone
        email: formData.email,
        endereco: formData.endereco
      };

      if (dialogMode === 'add') {
        await createPaciente(pacienteData);
        debug.success('Paciente criado com sucesso!');
        setSuccessMessage({
          title: 'Sucesso!',
          message: `Paciente "${formData.nome}" foi criado com sucesso.`
        });
      } else if (selectedPaciente) {
        await updatePaciente(selectedPaciente.id, pacienteData);
        debug.success('Paciente atualizado com sucesso!');
        setSuccessMessage({
          title: 'Sucesso!',
          message: `Paciente "${formData.nome}" foi atualizado com sucesso.`
        });
      }

      handleCloseDialog();
      setShowSuccessDialog(true);
      fetchPacientes({ page: 1, pageSize: 10 }); // Recarregar lista
    } catch (error: any) {
      debug.error('Erro ao salvar:', error);
      addNotification(error.message || 'Erro ao salvar paciente', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPaciente) return;

    try {
      setSaving(true);
      debug.warning('Excluindo paciente:', selectedPaciente.id);

      await deletePaciente(selectedPaciente.id);
      debug.success('Paciente excluído com sucesso!');

      setSuccessMessage({
        title: 'Excluído!',
        message: `Paciente "${selectedPaciente.nome}" foi excluído com sucesso.`
      });

      setShowDeleteDialog(false);
      handleCloseDialog();
      setShowSuccessDialog(true);
      fetchPacientes({ page: 1, pageSize: 10 }); // Recarregar lista
    } catch (error: any) {
      debug.error('Erro ao excluir:', error);
      addNotification(error.message || 'Erro ao excluir paciente', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;

    // Aplicar máscaras durante a digitação
    switch (field) {
      case 'documento':
        formattedValue = applyCPFMask(value);
        break;
      case 'telefone':
        formattedValue = applyPhoneMask(value);
        break;
      default:
        formattedValue = value;
    }

    setFormData(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  };

  // Os dados já vêm paginados da API, não precisamos paginar localmente
  const paginatedData = pacientes;

  return (
    <Box>
      {/* Título e Descrição */}
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestão de Pacientes
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
          Cadastro e manutenção de pacientes do sistema
        </Typography>
      </Box>

      {/* Card Principal */}
      <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3 }}>
        <CardContent sx={{ p: { xs: 1, md: 3 } }}>
          {/* Cabeçalho do Grid */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3
          }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNew}
              size={isMobile ? 'small' : 'medium'}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                }
              }}
            >
              Adicionar Paciente
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {total > 0 ? `${((currentPage - 1) * pageSize) + 1}-${Math.min(currentPage * pageSize, total)} de ${total}` : '0 de 0'}
              </Typography>
              <Pagination
                count={totalPagesFromHook}
                page={currentPage}
                onChange={(_, newPage) => {
                  debug.info(`Mudando para página ${newPage}`);
                  fetchPacientes({ page: newPage, pageSize });
                }}
                size="small"
                color="primary"
              />
            </Box>
          </Box>

          {/* Tabela de Dados */}
          <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider', maxHeight: 450 }}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: 'rgba(102, 126, 234, 0.1)' }}>
                <TableRow>
                  <TableCell><strong>Nome</strong></TableCell>
                  <TableCell><strong>CPF</strong></TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}><strong>Data de Nascimento</strong></TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}><strong>Telefone</strong></TableCell>
                  <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}><strong>Email</strong></TableCell>
                  <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}><strong>Cadastrado em</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((paciente) => (
                  <TableRow
                    key={paciente.id}
                    onClick={() => handleRowClick(paciente)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'rgba(102, 126, 234, 0.04)'
                      }
                    }}
                  >
                    <TableCell>{paciente.nome}</TableCell>
                    <TableCell>{formatCPF(paciente.documento)}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      {formatDateBR(paciente.dataNascimento)}
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      {paciente.telefone ? formatPhone(paciente.telefone) : '-'}
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                      {paciente.email || '-'}
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                      {paciente.createdAt ?
                        formatDateBR(paciente.createdAt) :
                        'N/A'
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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
            minHeight: { xs: 'auto', sm: 'auto' }
          }
        }}
      >
        <DialogTitle sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          <PersonIcon />
          {dialogMode === 'add' ? 'Adicionar Paciente' : 'Editar Paciente'}
        </DialogTitle>

        <DialogContent sx={{ pt: 4, px: 3, pb: 2, overflow: 'auto' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Nome Completo"
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              variant="outlined"
              size="small"
              required
            />
            <TextField
              fullWidth
              label="CPF"
              placeholder="000.000.000-00"
              value={formData.documento}
              onChange={(e) => handleInputChange('documento', e.target.value)}
              variant="outlined"
              size="small"
              required
              inputProps={{ maxLength: 14 }}
            />
            <TextField
              fullWidth
              label="Data de Nascimento"
              type="date"
              value={formData.dataNascimento}
              onChange={(e) => handleInputChange('dataNascimento', e.target.value)}
              variant="outlined"
              size="small"
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              fullWidth
              label="Telefone"
              placeholder="(11) 99999-9999"
              value={formData.telefone}
              onChange={(e) => handleInputChange('telefone', e.target.value)}
              variant="outlined"
              size="small"
              inputProps={{ maxLength: 15 }}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              variant="outlined"
              size="small"
            />
            <TextField
              fullWidth
              label="Endereço"
              value={formData.endereco}
              onChange={(e) => handleInputChange('endereco', e.target.value)}
              variant="outlined"
              size="small"
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={handleCloseDialog}
            disabled={saving}
            color="inherit"
          >
            Cancelar
          </Button>

          {dialogMode === 'edit' && (
            <Button
              onClick={handleDeleteClick}
              disabled={saving}
              color="error"
              variant="outlined"
              startIcon={<DeleteIcon />}
            >
              Excluir
            </Button>
          )}

          <Button
            onClick={handleSave}
            disabled={saving || !formData.nome || !formData.documento || !formData.dataNascimento}
            color="primary"
            variant="contained"
            startIcon={dialogMode === 'add' ? <AddIcon /> : <EditIcon />}
          >
            {saving ?
              (dialogMode === 'add' ? 'Criando...' : 'Salvando...') :
              (dialogMode === 'add' ? 'Criar' : 'Salvar')
            }
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmação de exclusão */}
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        itemName={selectedPaciente?.nome || ''}
        itemType="o paciente"
        loading={saving}
      />

      {/* Diálogo de sucesso */}
      <SuccessDialog
        open={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        title={successMessage.title}
        message={successMessage.message}
        autoClose={true}
        autoCloseDelay={3000}
      />
    </Box>
  );
};

export default PacientesPageTable;
