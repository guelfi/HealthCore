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
} from '@mui/material';
import {
  Edit,
  Delete,
  Search,
  Add,
  Person,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { mockPacientes } from '../../../application/stores/mockData';
import { Paciente } from '../../../domain/entities/Paciente';
import { useUIStore } from '../../../application/stores/uiStore';

const PacientesList: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useUIStore();
  
  const [pacientes] = React.useState<Paciente[]>(mockPacientes);
  const [filteredPacientes, setFilteredPacientes] = React.useState<Paciente[]>(mockPacientes);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [loading] = React.useState(false);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  React.useEffect(() => {
    const filtered = pacientes.filter(paciente =>
      paciente.nome.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      paciente.cpf.includes(debouncedSearchTerm) ||
      paciente.email?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
    setFilteredPacientes(filtered);
    setPage(0);
  }, [debouncedSearchTerm, pacientes]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleEdit = (paciente: Paciente) => {
    navigate(`/pacientes/editar/${paciente.id}`);
  };

  const handleDelete = (paciente: Paciente) => {
    // Mock delete - in real app, would show confirmation dialog
    addNotification(`Paciente ${paciente.nome} removido com sucesso`, 'success');
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedPacientes = filteredPacientes.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const columns = [
    {
      id: 'nome',
      label: 'Nome',
      format: (value: string, row: Paciente) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Person color="action" />
          {value}
        </Box>
      ),
    },
    {
      id: 'cpf',
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
      format: (value: any, row: Paciente) => (
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
        <Typography variant="h4" component="h1" gutterBottom>
          Pacientes
        </Typography>
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
          <Box mb={2}>
            <TextField
              fullWidth
              placeholder="Buscar por nome, CPF ou email..."
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
            data={paginatedPacientes}
            keyField="id"
            emptyMessage={searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
          />

          <TablePagination
            component="div"
            count={filteredPacientes.length}
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
    </Box>
  );
};

export default PacientesList;