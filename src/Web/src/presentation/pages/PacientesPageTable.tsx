import React, { useState } from 'react';
import {
  useTheme,
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

  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Visibility,
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
import CustomPagination from '../components/common/CustomPagination';

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
  const [pageSize] = useState(7);
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
      await deletePaciente(selectedPaciente.id);
      debug.success('Paciente excluído com sucesso!');
      setSuccessMessage({
        title: 'Sucesso!',
        message: `Paciente "${selectedPaciente.nome}" foi excluído com sucesso.`
      });
      setShowDeleteDialog(false);
      handleCloseDialog(); // Fechar o dialog principal de edição
      setShowSuccessDialog(true);
      fetchPacientes({ page: 1, pageSize: 10 }); // Recarregar lista
    } catch (error: any) {
      debug.error('Erro ao excluir:', error);
      addNotification(error.message || 'Erro ao excluir paciente', 'error');
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const handlePageChange = (newPage: number) => {
    debug.info('Mudando página:', { newPage });
    fetchPacientes({ page: newPage, pageSize });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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
        <Typography variant="body1" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
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
      <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3 }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
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
            <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
              <Table size="small">
                <TableHead sx={{ backgroundColor: 'rgba(102, 126, 234, 0.1)' }}>
                  <TableRow>
                    <TableCell align="center" sx={{ width: 50, py: 1 }}></TableCell>
                    <TableCell sx={{ py: 1 }}><strong>Nome</strong></TableCell>
                    <TableCell sx={{ py: 1 }}><strong>Documento</strong></TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, py: 1 }}><strong>Data de Nascimento</strong></TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, py: 1 }}><strong>Telefone</strong></TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, py: 1 }}><strong>E-mail</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pacientes.map((paciente) => (
                    <TableRow 
                      key={paciente.id}
                      onClick={() => handleRowClick(paciente)}
                      sx={{ 
                        cursor: 'pointer',
                        height: 35,
                        '&:hover': { 
                          backgroundColor: 'rgba(102, 126, 234, 0.04)' 
                        }
                      }}
                    >
                      <TableCell align="center" sx={{ py: '1px' }}>
                        <Visibility 
                          color="action" 
                          sx={{ 
                            fontSize: '1.1rem',
                            cursor: 'pointer',
                            '&:hover': { color: 'primary.main' }
                          }} 
                        />
                      </TableCell>
                      <TableCell sx={{ py: '1px' }}>{paciente.nome}</TableCell>
                      <TableCell sx={{ py: '1px' }}>{formatCPF(paciente.documento)}</TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, py: '1px' }}>{formatDateBR(paciente.dataNascimento)}</TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, py: '1px' }}>{formatPhone(paciente.telefone || '')}</TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, py: '1px' }}>{paciente.email || '-'}</TableCell>
                    </TableRow>
                  ))}
                  {pacientes.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography variant="body1" color="text.secondary" sx={{ py: 4 }}>
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
            margin: { xs: 1, sm: 3 }
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
        
        <DialogContent sx={{ pt: 1.625, px: 1.5, pb: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1, sm: 1.2 }, mt: 2.25 }}>
            <TextField
              fullWidth
              label="Nome *"
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              disabled={saving}
              size="small"
              sx={{
                '& .MuiInputBase-root': {
                  padding: '4px 6px'
                },
                '& .MuiInputBase-input': {
                  padding: '4px 0'
                }
              }}
            />
            
            <Box sx={{ display: 'flex', gap: { xs: 1, sm: 1.5 } }}>
              <TextField
                fullWidth
                label="Documento (CPF) *"
                value={formData.documento}
                onChange={(e) => handleDocumentoChange(e.target.value)}
                disabled={saving}
                inputProps={{ maxLength: 14 }}
                size="small"
                sx={{
                  '& .MuiInputBase-root': {
                    padding: '4px 6px'
                  },
                  '& .MuiInputBase-input': {
                    padding: '4px 0'
                  }
                }}
              />
              
              <TextField
                fullWidth
                label="Data de Nascimento *"
                type="date"
                value={formData.dataNascimento}
                onChange={(e) => handleInputChange('dataNascimento', e.target.value)}
                InputLabelProps={{ shrink: true }}
                disabled={saving}
                size="small"
                sx={{
                  '& .MuiInputBase-root': {
                    padding: '4px 6px'
                  },
                  '& .MuiInputBase-input': {
                    padding: '4px 0'
                  }
                }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: { xs: 1, sm: 1.5 } }}>
              <TextField
                fullWidth
                label="Telefone"
                value={formData.telefone}
                onChange={(e) => handleTelefoneChange(e.target.value)}
                disabled={saving}
                inputProps={{ maxLength: 15 }}
                size="small"
                sx={{
                  '& .MuiInputBase-root': {
                    padding: '4px 6px'
                  },
                  '& .MuiInputBase-input': {
                    padding: '4px 0'
                  }
                }}
              />
              
              <TextField
                fullWidth
                label="E-mail"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={saving}
                size="small"
                sx={{
                  '& .MuiInputBase-root': {
                    padding: '4px 6px'
                  },
                  '& .MuiInputBase-input': {
                    padding: '4px 0'
                  }
                }}
              />
            </Box>
            
            <TextField
              fullWidth
              label="Endereço"
              multiline
              rows={2}
              value={formData.endereco}
              onChange={(e) => handleInputChange('endereco', e.target.value)}
              disabled={saving}
              size="small"
              sx={{
                '& .MuiInputBase-root': {
                  padding: '4px 6px'
                },
                '& .MuiInputBase-input': {
                  padding: '4px 0'
                }
              }}
            />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 1.5, gap: 1, justifyContent: 'flex-end' }}>
          {dialogMode === 'edit' && (
            <Button
              onClick={() => setShowDeleteDialog(true)}
              disabled={saving}
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              sx={{ padding: '3px 12px' }}
            >
              Excluir
            </Button>
          )}
          
          <Button
            onClick={handleSave}
            disabled={saving}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              },
              padding: '3px 12px'
            }}
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
          
          <Button
            onClick={handleCloseDialog}
            disabled={saving}
            variant="outlined"
            sx={{ padding: '3px 12px' }}
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Confirmação de Exclusão */}
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        itemName={selectedPaciente?.nome || ''}
        itemType="paciente"
        loading={saving}
      />

      {/* Diálogo de Sucesso */}
      <SuccessDialog
        open={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        title={successMessage.title}
        message={successMessage.message}
      />
    </>
  );
};

export default PacientesPageTable;