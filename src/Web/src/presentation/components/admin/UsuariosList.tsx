import React from 'react';
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
  Skeleton,
  Switch,
} from '@mui/material';
import {
  Edit,
  Delete,
  Search,
  Add,
  Visibility,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { mockUsuarios } from '../../../application/stores/mockData';
import type { Usuario } from '../../../domain/entities/Usuario';
import { UserProfile } from '../../../domain/enums/UserProfile';
import { useUIStore } from '../../../application/stores/uiStore';

const UsuariosList: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useUIStore();
  
  const [usuarios, setUsuarios] = React.useState<Usuario[]>(mockUsuarios);
  const [filteredUsuarios, setFilteredUsuarios] = React.useState<Usuario[]>(mockUsuarios);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(7);
  const [loading] = React.useState(false);

  React.useEffect(() => {
    const filtered = usuarios.filter(usuario =>
      usuario.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.role.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsuarios(filtered);
    setPage(0);
  }, [searchTerm, usuarios]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleEdit = (usuario: Usuario) => {
    navigate(`/admin/usuarios/editar/${usuario.id}`);
  };

  const handleToggleActive = (usuario: Usuario) => {
    const updatedUsuarios = usuarios.map(u =>
      u.id === usuario.id ? { ...u, isActive: !u.isActive } : u
    );
    setUsuarios(updatedUsuarios);
    
    const status = usuario.isActive ? 'desativado' : 'ativado';
    addNotification(`Usuário ${usuario.username} ${status} com sucesso`, 'success');
  };

  const handleDelete = (usuario: Usuario) => {
    // Mock delete - in real app, would show confirmation dialog
    const updatedUsuarios = usuarios.filter(u => u.id !== usuario.id);
    setUsuarios(updatedUsuarios);
    addNotification(`Usuário ${usuario.username} removido com sucesso`, 'success');
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedUsuarios = filteredUsuarios.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );



  const getRoleColor = (role: UserProfile) => {
    return role === UserProfile.ADMINISTRADOR ? 'error' : 'primary';
  };

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={200} height={40} />
        <Skeleton variant="rectangular" width="100%" height={400} sx={{ mt: 2 }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Usuários
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gerencie os usuários do sistema
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/admin/usuarios/novo')}
        >
          Novo Usuário
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Box mb={2}>
            <TextField
              fullWidth
              placeholder="Buscar por username ou perfil..."
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
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead sx={{ backgroundColor: 'rgba(102, 126, 234, 0.1)' }}>
                <TableRow>
                  <TableCell align="center" sx={{ width: 50 }}></TableCell>
                  <TableCell><strong>Nome</strong></TableCell>
                  <TableCell><strong>Perfil</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Cadastrado em</strong></TableCell>
                  <TableCell align="center"><strong>Ações</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedUsuarios.map((usuario) => (
                  <TableRow 
                    key={usuario.id}
                    onClick={() => navigate(`/admin/usuarios/${usuario.id}`)}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'rgba(102, 126, 234, 0.04)' }
                    }}
                  >
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
                    <TableCell>{usuario.username}</TableCell>
                    <TableCell>
                      <Chip
                        label={usuario.role}
                        color={getRoleColor(usuario.role as UserProfile)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={usuario.isActive ? 'Ativo' : 'Inativo'}
                        color={usuario.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {usuario.createdAt ? new Date(usuario.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                    </TableCell>
                    <TableCell align="center">
                      <Switch
                        checked={usuario.isActive}
                        onChange={() => handleToggleActive(usuario)}
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(usuario)}
                        color="primary"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(usuario)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedUsuarios.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredUsuarios.length}
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

export default UsuariosList;