import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Button,
  TablePagination,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  Edit,
  Delete,
  Search,
  Add,
  Assignment,
  Visibility,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useExames, usePacientes } from '../../hooks';
import type { Exame } from '../../../domain/entities/Exame';
import { ModalidadeDicom, ModalidadeDicomLabels } from '../../../domain/enums/ModalidadeDicom';
import { useUIStore } from '../../../application/stores/uiStore';

const ExamesList: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useUIStore();
  
  // Hooks para exames e pacientes
  const {
    exames,
    total,
    loading,
    error,
    fetchExames,
    deleteExame,
  } = useExames();
  
  const {
    pacientes: allPacientes,
    fetchPacientes,
  } = usePacientes();

  const [searchTerm, setSearchTerm] = useState('');
  const [modalidadeFilter, setModalidadeFilter] = useState<string>('');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(7);

  // Carregar exames e pacientes ao montar o componente
  useEffect(() => {
    fetchExames({ page: page + 1, pageSize: rowsPerPage });
    fetchPacientes({ page: 1, pageSize: 100 }); // Carregar todos os pacientes
  }, [page, rowsPerPage, fetchExames, fetchPacientes]);

  // Aplicar filtros quando eles mudarem
  useEffect(() => {
    const filters: any = {
      page: page + 1,
      pageSize: rowsPerPage,
    };
    
    if (modalidadeFilter) {
      filters.modalidade = modalidadeFilter;
    }
    
    fetchExames(filters);
  }, [modalidadeFilter, page, rowsPerPage, fetchExames]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    // Implementar busca por termo
  };

  const handleModalidadeFilterChange = (event: any) => {
    setModalidadeFilter(event.target.value);
  };

  const handleEdit = (exame: Exame) => {
    navigate(`/exames/editar/${exame.id}`);
  };

  const handleDelete = async (exame: Exame) => {
    try {
      await deleteExame(exame.id);
      addNotification(`Exame removido com sucesso`, 'success');
    } catch (error) {
      addNotification(`Erro ao remover exame`, 'error');
    }
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getModalidadeColor = (modalidade: ModalidadeDicom) => {
    const colors: Record<ModalidadeDicom, 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
      [ModalidadeDicom.CR]: 'info',
      [ModalidadeDicom.CT]: 'primary',
      [ModalidadeDicom.DX]: 'warning',
      [ModalidadeDicom.MG]: 'primary',
      [ModalidadeDicom.MR]: 'secondary',
      [ModalidadeDicom.NM]: 'secondary',
      [ModalidadeDicom.OT]: 'error',
      [ModalidadeDicom.PT]: 'success',
      [ModalidadeDicom.RF]: 'warning',
      [ModalidadeDicom.US]: 'success',
      [ModalidadeDicom.XA]: 'info',
    };
    return colors[modalidade] || 'default';
  };

  // Obter nome do paciente pelo ID
  const getPacienteName = (pacienteId: string) => {
    const paciente = allPacientes.find(p => p.id === pacienteId);
    return paciente ? paciente.nome : 'N/A';
  };

  // Obter CPF do paciente pelo ID
  const getPacienteDocumento = (pacienteId: string) => {
    const paciente = allPacientes.find(p => p.id === pacienteId);
    return paciente ? paciente.documento : 'N/A';
  };

  if (loading && exames.length === 0) {
    return (
      <Box>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {/* Mensagem de erro */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Exames
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gerencie os exames cadastrados no sistema
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/exames/novo')}
        >
          Novo Exame
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Box display="flex" gap={2} mb={2}>
            <TextField
              fullWidth
              placeholder="Buscar por paciente, CPF ou descrição..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Modalidade</InputLabel>
              <Select
                value={modalidadeFilter}
                onChange={handleModalidadeFilterChange}
                label="Modalidade"
              >
                <MenuItem value="">Todas</MenuItem>
                {Object.values(ModalidadeDicom).map((modalidade) => (
                  <MenuItem key={modalidade} value={modalidade}>
                    {modalidade} - {ModalidadeDicomLabels[modalidade]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {loading && exames.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={{ width: 50 }}></TableCell>
                  <TableCell>Paciente</TableCell>
                  <TableCell>CPF</TableCell>
                  <TableCell>Modalidade</TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell>Data do Exame</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {exames.map((exame) => (
                  <TableRow key={exame.id} hover sx={{ cursor: 'pointer' }}>
                    <TableCell align="center">
                      <Visibility 
                        color="action" 
                        sx={{ 
                          fontSize: '1.2rem',
                          cursor: 'pointer',
                          '&:hover': { color: 'primary.main' }
                        }} 
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Assignment color="action" />
                        {getPacienteName(exame.pacienteId)}
                      </Box>
                    </TableCell>
                    <TableCell>{getPacienteDocumento(exame.pacienteId)}</TableCell>
                    <TableCell>
                      <Chip
                        label={ModalidadeDicomLabels[exame.modalidade] || exame.modalidade}
                        color={getModalidadeColor(exame.modalidade)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{exame.descricao || '-'}</TableCell>
                    <TableCell>
                      {new Date(exame.dataExame).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(exame)}
                        color="primary"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(exame)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {exames.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        Nenhum exame cadastrado
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Linhas por página:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
            }
          />
        </CardContent>
      </Card>
    </>
  );
};

export default ExamesList;