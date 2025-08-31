import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  TablePagination,
  Alert,
  Chip,
} from '@mui/material';
import {
  Edit,
  Delete,
  Search,
  Add,
  Person,
  Refresh,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { Paciente } from '../../../domain/entities/Paciente';
import { useUIStore } from '../../../application/stores/uiStore';
import { usePacientes } from '../../hooks/usePacientes';
import { useDebounce } from '../../hooks/useDebounce';
import ResponsiveTable from '../common/ResponsiveTable';
import { TableSkeleton } from '../common/LoadingStates';
import { useAutoDebugger } from '../../../utils/AutoDebugger';

const PacientesList: React.FC = () => {
  const debug = useAutoDebugger('PacientesList');
  debug.info('Componente inicializado!');
  
  const navigate = useNavigate();
  const { addNotification } = useUIStore();
  
  const {
    pacientes,
    total,
    currentPage,
    totalPages,
    loading,
    error,
    fetchPacientes,
    deletePaciente,
    clearError
  } = usePacientes();
  
  const [searchTerm, setSearchTerm] = React.useState('');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Load patients on component mount and when filters change
  React.useEffect(() => {
    debug.info('useEffect disparado com filtros:', {
      debouncedSearchTerm,
      page,
      rowsPerPage
    });
    
    const loadPacientes = () => {
      const params = {
        page: page + 1, // API uses 1-based pagination
        pageSize: rowsPerPage,
        ...(debouncedSearchTerm && {
          nome: debouncedSearchTerm,
          documento: debouncedSearchTerm
        })
      };
      
      debug.info('Carregando pacientes com parâmetros:', params);
      debug.debug('Estado atual do hook:', { 
        pacientes: pacientes.length, 
        loading, 
        error, 
        total 
      });
      
      fetchPacientes(params);
    };
    
    loadPacientes();
  }, [debouncedSearchTerm, page, rowsPerPage, fetchPacientes]);
  
  // Debug: log quando pacientes mudam
  React.useEffect(() => {
    debug.info('Lista de pacientes atualizada:', {
      quantidade: pacientes.length,
      primeiroPaciente: pacientes[0]?.nome || 'nenhum',
      loading,
      error,
      total
    });
  }, [pacientes, loading, error, total]);
  
  // Clear errors when component unmounts
  React.useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleEdit = (paciente: Paciente) => {
    navigate(`/pacientes/editar/${paciente.id}`);
  };

  const handleDelete = async (paciente: Paciente) => {
    if (window.confirm(`Tem certeza que deseja excluir o paciente ${paciente.nome}?`)) {
      try {
        await deletePaciente(paciente.id);
        addNotification(`Paciente ${paciente.nome} removido com sucesso`, 'success');
      } catch (error: any) {
        addNotification(error.message || 'Erro ao excluir paciente', 'error');
      }
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleRefresh = () => {
    fetchPacientes({
      page: page + 1,
      pageSize: rowsPerPage,
      ...(debouncedSearchTerm && {
        nome: debouncedSearchTerm,
        documento: debouncedSearchTerm
      })
    });
  };

  const columns = [
    {
      id: 'nome',
      label: 'Nome',
      format: (value: string) => (
        <Box display="flex" alignItems="center" gap={0.375}>
          <Person color="action" />
          {value}
        </Box>
      ),
    },
    {
      id: 'documento',
      label: 'CPF',
    },
    {
      id: 'dataNascimento',
      label: 'Data de Nascimento',
      format: (value: Date) => new Date(value).toLocaleDateString('pt-BR'),
      hideOnMobile: true,
    },
    {
      id: 'telefone',
      label: 'Telefone',
      format: (value: string) => value || '-',
      hideOnMobile: true,
    },
    {
      id: 'email',
      label: 'Email',
      format: (value: string) => value || '-',
      hideOnMobile: true,
    },
    {
      id: 'actions',
      label: 'Ações',
      align: 'center' as const,
      format: (value: any, row: any) => (
        <Box>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
            color="primary"
            aria-label={`Editar paciente ${row.nome}`}
          >
            <Edit />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row);
            }}
            color="error"
            aria-label={`Excluir paciente ${row.nome}`}
          >
            <Delete />
          </IconButton>
        </Box>
      ),
    },
  ];

  if (loading) {
    return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Pacientes
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gerencie os pacientes cadastrados no sistema
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/pacientes/novo')}
          >
            Novo Paciente
          </Button>
        </Box>
        <Card>
          <CardContent>
            <TableSkeleton rows={5} columns={6} />
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Pacientes
            <Chip 
              label="API Real" 
              color="success" 
              size="small" 
              sx={{ ml: 2 }} 
            />
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gerencie os pacientes cadastrados no sistema ({total} encontrados)
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Atualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/pacientes/novo')}
          >
            Novo Paciente
          </Button>
        </Box>
      </Box>

      <Card>
        <CardContent>
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 2 }}
              action={
                <Button color="inherit" size="small" onClick={clearError}>
                  Fechar
                </Button>
              }
            >
              {error}
            </Alert>
          )}
          
          <Box mb={2}>
            <TextField
              fullWidth
              placeholder="Buscar por nome ou CPF..."
              value={searchTerm}
              onChange={handleSearchChange}
              aria-label="Buscar pacientes"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <ResponsiveTable
            columns={columns}
            data={pacientes}
            keyField="id"
            emptyMessage={searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
          />

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={total}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Pacientes por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default PacientesList;