import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fab,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  CardActions,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  Visibility,
  MedicalServices,
} from '@mui/icons-material';
import { useEspecialidades } from '../hooks/useEspecialidades';
import { useAuthStore } from '../../application/stores/authStore';
import { UserProfile } from '../../domain/enums/UserProfile';
import type { Especialidade } from '../../domain/entities';
import EspecialidadeDialog from '../components/especialidades/EspecialidadeDialog';
import EspecialidadeDeleteDialog from '../components/especialidades/EspecialidadeDeleteDialog';
import EspecialidadeViewDialog from '../components/especialidades/EspecialidadeViewDialog';
import {
  standardCardStyles,
  standardCardContentStyles,
  standardDialogTitleStyles,
} from '../styles/cardStyles';
import StandardDialogButtons from '../components/common/StandardDialogButtons';
import ResponsiveTableHeader from '../../components/ui/Layout/ResponsiveTableHeader';

const EspecialidadesPageTable: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuthStore();
  
  const {
    especialidades,
    loading,
    error,
    total,
    page,
    pageSize,
    totalPages,
    currentPage,
    filters,
    setPage,
    setPageSize,
    setFilters,
    createEspecialidade,
    updateEspecialidade,
    deleteEspecialidade,
    fetchEspecialidades,
  } = useEspecialidades();

  // Estados para diálogos
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedEspecialidade, setSelectedEspecialidade] = useState<Especialidade | null>(null);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [saving, setSaving] = useState(false);

  // Estados para formulário
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    ativa: true,
  });

  const handleRowClick = (especialidade: Especialidade) => {
    setSelectedEspecialidade(especialidade);
    setFormData({
      nome: especialidade.nome,
      descricao: especialidade.descricao || '',
      ativa: especialidade.ativa,
    });
    setDialogMode('edit');
    setOpenDialog(true);
  };

  const handleAddNew = () => {
    setSelectedEspecialidade(null);
    setFormData({
      nome: '',
      descricao: '',
      ativa: true,
    });
    setDialogMode('add');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEspecialidade(null);
    setSaving(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (dialogMode === 'add') {
        await createEspecialidade(formData);
      } else if (selectedEspecialidade) {
        await updateEspecialidade(selectedEspecialidade.id, formData);
      }
      handleCloseDialog();
      await fetchEspecialidades({ page, pageSize });
    } catch (error) {
      console.error('Erro ao salvar especialidade:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedEspecialidade) {
      setSaving(true);
      try {
        await deleteEspecialidade(selectedEspecialidade.id);
        setOpenDeleteDialog(false);
        handleCloseDialog();
        await fetchEspecialidades({ page, pageSize });
      } catch (error) {
        console.error('Erro ao deletar especialidade:', error);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleView = (especialidade: Especialidade) => {
    setSelectedEspecialidade(especialidade);
    setOpenViewDialog(true);
  };

  const handleEdit = (especialidade: Especialidade) => {
    handleRowClick(especialidade);
  };

  const handleDelete = (especialidade: Especialidade) => {
    setSelectedEspecialidade(especialidade);
    setOpenDeleteDialog(true);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchEspecialidades({ page: newPage, pageSize });
  };

  // Render mobile card
  const renderMobileCard = (especialidade: Especialidade) => (
    <Card key={especialidade.id} sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={1}>
          <Typography variant="h6" component="div">
            {especialidade.nome}
          </Typography>
          <Chip
            label={especialidade.ativa ? 'Ativa' : 'Inativa'}
            color={especialidade.ativa ? 'success' : 'default'}
            size="small"
            sx={{ ml: 'auto' }}
          />
        </Box>
        
        {especialidade.descricao && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {especialidade.descricao}
          </Typography>
        )}
      </CardContent>
      
      <CardActions>
        <IconButton
          size="small"
          onClick={() => handleView(especialidade)}
          title="Visualizar"
        >
          <Visibility />
        </IconButton>
      </CardActions>
    </Card>
  );

  // Render desktop table
  const renderDesktopTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead sx={{ backgroundColor: 'rgba(102, 126, 234, 0.1)' }}>
          <TableRow>
            <TableCell align="center" sx={{ width: 50 }}></TableCell>
            <TableCell><strong>Nome</strong></TableCell>
            <TableCell><strong>Descrição</strong></TableCell>
            <TableCell><strong>Status</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {especialidades.map((especialidade) => (
            <TableRow 
              key={especialidade.id}
              onClick={() => handleRowClick(especialidade)}
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <TableCell align="center">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRowClick(especialidade);
                  }}
                  title="Editar"
                >
                  <Visibility />
                </IconButton>
              </TableCell>
              <TableCell>
                {especialidade.nome}
              </TableCell>
              <TableCell>
                {especialidade.descricao || '-'}
              </TableCell>
              <TableCell>
                <Chip
                  label={especialidade.ativa ? 'Ativa' : 'Inativa'}
                  color={especialidade.ativa ? 'success' : 'default'}
                  size="small"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box>
      {/* Título e Descrição */}
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestão de Especialidades
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ display: { xs: 'none', md: 'block' } }}
        >
          Cadastro e manutenção de especialidades médicas
        </Typography>
      </Box>

      {/* Card Principal */}
      <Card sx={standardCardStyles}>
        <CardContent sx={standardCardContentStyles}>
          {/* Header Responsivo */}
          <ResponsiveTableHeader
            onAddClick={handleAddNew}
            addButtonText="Adicionar Especialidade"
            addButtonDisabled={loading || saving}
            totalItems={total}
            itemName="especialidades"
            showTotalOnMobile={false}
            fabTooltip="Adicionar Especialidade"
          />

          {/* Mensagem de Erro */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Loading */}
          {loading && (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          )}

          {/* Conteúdo */}
          {!loading && (
            <>
              {isMobile ? (
                <Box>
                  {especialidades.map(renderMobileCard)}
                </Box>
              ) : (
                renderDesktopTable()
              )}

              {/* Paginação */}
              <Box display="flex" justifyContent="center" mt={2}>
                <TablePagination
                  component="div"
                  count={total}
                  page={page - 1}
                  onPageChange={(_, newPage) => handlePageChange(newPage + 1)}
                  rowsPerPage={pageSize}
                  onRowsPerPageChange={(e) => setPageSize(parseInt(e.target.value))}
                  labelRowsPerPage="Itens por página:"
                  labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
                  }
                />
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog de CRUD */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            minHeight: { xs: 'auto', sm: 'auto' },
          },
        }}
      >
        <DialogTitle sx={standardDialogTitleStyles}>
          <MedicalServices />
          {dialogMode === 'add' ? 'Adicionar Especialidade' : 'Editar Especialidade'}
        </DialogTitle>

        <DialogContent sx={{ pt: 4.625, px: 3, pb: 2, overflow: 'auto' }}>
          <Box
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2.625 }}
          >
            <TextField
              fullWidth
              label="Nome da Especialidade"
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
            <TextField
              fullWidth
              label="Descrição"
              value={formData.descricao}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
              variant="outlined"
              size="small"
              multiline
              rows={3}
              sx={{
                '& .MuiInputBase-root': {
                  padding: '4px 6px',
                },
                '& .MuiInputBase-input': {
                  padding: '4px 0',
                },
              }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.ativa}
                  onChange={(e) => handleInputChange('ativa', e.target.checked)}
                />
              }
              label="Especialidade Ativa"
            />
            {selectedEspecialidade && (
              <Box
                sx={{
                  display: 'flex',
                  gap: 0.5,
                  flexWrap: 'wrap',
                  mt: 0.5,
                }}
              >
                <Chip
                  label={`ID: ${selectedEspecialidade.id}`}
                  variant="outlined"
                  size="small"
                  sx={{ fontSize: '0.65rem', height: '20px' }}
                />
                <Chip
                  label={`Criada em: ${new Date(selectedEspecialidade.dataCriacao).toLocaleDateString('pt-BR')}`}
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

      {/* Diálogo de Visualização */}
      <EspecialidadeViewDialog
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        especialidade={selectedEspecialidade}
      />

      {/* Diálogo de Exclusão */}
      <EspecialidadeDeleteDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        especialidade={selectedEspecialidade}
      />
    </Box>
  );
};

export default EspecialidadesPageTable;
