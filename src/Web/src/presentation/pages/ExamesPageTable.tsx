import React, { useState, useEffect } from 'react';
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
  Chip,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
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
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as ExameIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  useExames,
  usePacientes,
} from '../hooks';
import { ModalidadeDicom, ModalidadeDicomLabels } from '../../domain/enums/ModalidadeDicom';
import type { Exame } from '../../domain/entities/Exame';
import type { Paciente } from '../../domain/entities/Paciente';
import ExameForm from '../components/exames/ExameForm';
import CustomPagination from '../components/common/CustomPagination';

const ExamesPageTable: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  // Hooks para exames e pacientes
  const {
    exames,
    total,
    currentPage,
    totalPages,
    loading,
    error,
    fetchExames,
    deleteExame,
  } = useExames();
  
  const {
    pacientes: allPacientes,
    loading: pacientesLoading,
    fetchPacientes,
  } = usePacientes();

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedExame, setSelectedExame] = useState<Exame | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalidadeFilter, setModalidadeFilter] = useState<string>('');

  // Carregar exames e pacientes ao montar o componente
  useEffect(() => {
    fetchExames({ page: 1, pageSize });
    fetchPacientes({ page: 1, pageSize: 100 }); // Carregar todos os pacientes
  }, [fetchExames, fetchPacientes]);

  const handleRowClick = (exame: Exame) => {
    setSelectedExame(exame);
    setDialogMode('edit');
    setOpenDialog(true);
  };

  const handleAddNew = () => {
    setSelectedExame(null);
    setDialogMode('add');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedExame(null);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchExames({ page: newPage, pageSize });
  };

  const handleSaveSuccess = () => {
    handleCloseDialog();
    // Recarregar a lista de exames
    fetchExames({ page: currentPage, pageSize });
  };

  const handleDelete = async (exameId: string) => {
    try {
      await deleteExame(exameId);
      // Recarregar a lista de exames
      fetchExames({ page: currentPage, pageSize });
    } catch (err) {
      console.error('Erro ao deletar exame:', err);
    }
  };

  const paginatedData = exames;
  const totalItems = total;

  // Obter nome do paciente pelo ID
  const getPacienteName = (pacienteId: string) => {
    const paciente = allPacientes.find(p => p.id === pacienteId);
    return paciente ? paciente.nome : 'N/A';
  };

  return (
    <>
      {/* Título e Descrição */}
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestão de Exames
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
          Cadastro e manutenção de exames médicos
        </Typography>
      </Box>

      {/* Mensagem de erro */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Card Principal */}
      <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
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
              Adicionar Exame
            </Button>
            
            <CustomPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={pageSize}
              onPageChange={handlePageChange}
              size="small"
            />
          </Box>

          {/* Estado de carregamento */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Tabela de Dados */}
          {!loading && (
            <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider', maxHeight: 450 }}>
              <Table size="small">
                <TableHead sx={{ backgroundColor: 'rgba(102, 126, 234, 0.1)' }}>
                  <TableRow>
                    <TableCell><strong>Paciente</strong></TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}><strong>Modalidade</strong></TableCell>
                    <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}><strong>Descrição</strong></TableCell>
                    <TableCell><strong>Data do Exame</strong></TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}><strong>Cadastrado em</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.map((exame) => (
                    <TableRow 
                      key={exame.id}
                      onClick={() => handleRowClick(exame)}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { 
                          backgroundColor: 'rgba(102, 126, 234, 0.04)' 
                        }
                      }}
                    >
                      <TableCell>{getPacienteName(exame.pacienteId)}</TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{ModalidadeDicomLabels[exame.modalidade] || exame.modalidade}</TableCell>
                      <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>{exame.descricao || '-'}</TableCell>
                      <TableCell>{new Date(exame.dataExame).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{new Date(exame.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                    </TableRow>
                  ))}
                  {paginatedData.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography variant="body1" color="text.secondary" sx={{ py: 4 }}>
                          Nenhum exame encontrado
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
        maxWidth={false}
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            width: { xs: '95vw', sm: '550px' },
            maxWidth: '550px',
            margin: { xs: 1, sm: 3 },
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
          <ExameIcon />
          {dialogMode === 'add' ? 'Adicionar Exame' : 'Editar Exame'}
        </DialogTitle>
        
        <DialogContent sx={{ 
          pt: 4.625, 
          px: 3, 
          pb: 2
        }}>
          <ExameForm
            mode={dialogMode}
            initialData={selectedExame}
            onSaveSuccess={handleSaveSuccess}
            onCancel={handleCloseDialog}
            onDelete={dialogMode === 'edit' && selectedExame ? () => handleDelete(selectedExame.id) : undefined}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExamesPageTable;