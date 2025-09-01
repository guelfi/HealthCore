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
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalHospital as MedicoIcon,
  Visibility,
} from '@mui/icons-material';
import { useMedicos } from '../hooks/useMedicos';
import type { Medico, CreateMedicoDto, UpdateMedicoDto } from '../../domain/entities/Medico';

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

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedMedico, setSelectedMedico] = useState<Medico | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(7);
  const [formData, setFormData] = useState<CreateMedicoDto>({
    nome: '',
    documento: '',
    crm: '',
    especialidade: '',
    telefone: '',
    email: '',
    username: '',
    password: '',
  });

  // Carregar médicos ao montar o componente
  useEffect(() => {
    fetchMedicos({ page, pageSize });
  }, [fetchMedicos, page, pageSize]);

  const handleRowClick = (medico: Medico) => {
    setSelectedMedico(medico);
    setFormData({
      nome: medico.nome,
      documento: medico.documento,
      crm: medico.crm,
      especialidade: medico.especialidade,
      telefone: medico.telefone || '',
      email: medico.email || '',
      username: medico.user?.username || '',
      password: '', // Não preencher senha na edição
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
    try {
      if (dialogMode === 'add') {
        await createMedico(formData);
      } else if (selectedMedico) {
        const updateData: UpdateMedicoDto = {
          nome: formData.nome,
          documento: formData.documento,
          crm: formData.crm,
          especialidade: formData.especialidade,
          telefone: formData.telefone,
          email: formData.email,
        };
        await updateMedico(selectedMedico.id, updateData);
      }
      handleCloseDialog();
      // Recarregar a lista
      await fetchMedicos({ page, pageSize });
    } catch (error) {
      console.error('Erro ao salvar médico:', error);
    }
  };

  const handleDelete = async () => {
    if (selectedMedico) {
      try {
        await deleteMedico(selectedMedico.id);
        handleCloseDialog();
        // Recarregar a lista
        await fetchMedicos({ page, pageSize });
      } catch (error) {
        console.error('Erro ao deletar médico:', error);
      }
    }
  };

  const handleInputChange = (field: keyof CreateMedicoDto, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3 }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
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
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background:
                    'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                },
              }}
            >
              Adicionar Médico
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ display: { xs: 'none', sm: 'block' } }}
              >
                Total: {total}
              </Typography>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(_, newPage) => handlePageChange(newPage)}
                size="small"
                color="primary"
              />
            </Box>
          </Box>

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
                      '&:hover': {
                        backgroundColor: 'rgba(102, 126, 234, 0.04)',
                      },
                    }}
                  >
                    <TableCell align="center">
                      <Visibility
                        color="action"
                        sx={{
                          fontSize: '1.2rem',
                          cursor: 'pointer',
                          '&:hover': { color: 'primary.main' },
                        }}
                      />
                    </TableCell>
                    <TableCell>{medico.nome}</TableCell>
                    <TableCell
                      sx={{ display: { xs: 'none', md: 'table-cell' } }}
                    >
                      {medico.crm}
                    </TableCell>
                    <TableCell>{medico.especialidade}</TableCell>
                    <TableCell
                      sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                    >
                      {medico.documento}
                    </TableCell>
                    <TableCell
                      sx={{ display: { xs: 'none', md: 'table-cell' } }}
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
            width: { xs: '95vw', sm: '500px' },
            maxWidth: '500px',
            margin: { xs: 1, sm: 3 },
            minHeight: { xs: 'auto', sm: 'auto' },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}
        >
          <MedicoIcon />
          {dialogMode === 'add' ? 'Adicionar Médico' : 'Editar Médico'}
        </DialogTitle>

        <DialogContent sx={{ pt: 1, px: 1.5, pb: 1 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: { xs: 1, sm: 1.2 },
              mt: 1,
            }}
          >
            <TextField
              fullWidth
              label="Nome Completo"
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              variant="outlined"
              size="small"
              required
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
              />
              <TextField
                fullWidth
                label="CRM"
                value={formData.crm}
                onChange={(e) => handleInputChange('crm', e.target.value)}
                variant="outlined"
                size="small"
                required
              />
            </Box>
            <TextField
              fullWidth
              label="Especialidade"
              value={formData.especialidade}
              onChange={(e) => handleInputChange('especialidade', e.target.value)}
              variant="outlined"
              size="small"
              required
            />
            <Box sx={{ display: 'flex', gap: { xs: 1, sm: 1.5 } }}>
              <TextField
                fullWidth
                label="Telefone"
                value={formData.telefone}
                onChange={(e) => handleInputChange('telefone', e.target.value)}
                variant="outlined"
                size="small"
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
            />
            {dialogMode === 'add' && (
              <TextField
                fullWidth
                label="Senha"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                variant="outlined"
                size="small"
                required
              />
            )}
            {selectedMedico && (
              <Box
                sx={{
                  display: 'flex',
                  gap: 0.5,
                  flexWrap: 'wrap',
                  mt: 1,
                }}
              >
                <Chip
                  label={`ID: ${selectedMedico.id}`}
                  variant="outlined"
                  size="small"
                  sx={{ fontSize: '0.65rem', height: '20px' }}
                />
                <Chip
                  label={selectedMedico.isActive ? 'Ativo' : 'Inativo'}
                  color={selectedMedico.isActive ? 'success' : 'error'}
                  variant="outlined"
                  size="small"
                  sx={{ fontSize: '0.65rem', height: '20px' }}
                />
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 0.5 }}>
          {dialogMode === 'edit' && (
            <Button
              onClick={handleDelete}
              color="error"
              variant="outlined"
              startIcon={<DeleteIcon />}
              size="small"
              sx={{ fontSize: '0.75rem' }}
              disabled={loading}
            >
              Excluir
            </Button>
          )}
          <Button
            onClick={handleCloseDialog}
            color="inherit"
            variant="outlined"
            size="small"
            sx={{ fontSize: '0.75rem' }}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            color="primary"
            variant="contained"
            startIcon={dialogMode === 'add' ? <AddIcon /> : <EditIcon />}
            size="small"
            sx={{ fontSize: '0.75rem' }}
            disabled={loading || !formData.nome || !formData.documento || !formData.crm || !formData.especialidade || !formData.username || (dialogMode === 'add' && !formData.password)}
          >
            {loading ? 'Salvando...' : dialogMode === 'add' ? 'Adicionar' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MedicosPageTable;
