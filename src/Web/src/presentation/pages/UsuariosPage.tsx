import React, { useState } from 'react';
import {
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
} from '@mui/material';
import {
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
  Person as UsuarioIcon,
} from '@mui/icons-material';
import { mockUsuarios } from '../../application/stores/mockData';
import { UserProfile } from '../../domain/enums/UserProfile';
import type { Usuario } from '../../domain/entities/Usuario';

const UsuariosPage: React.FC = () => {
  const [usuarios] = useState<Usuario[]>(mockUsuarios);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const profileLabels = {
    [UserProfile.ADMINISTRADOR]: 'Administrador',
    [UserProfile.MEDICO]: 'Médico',
  };

  const handleRowClick = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setDialogMode('edit');
    setOpenDialog(true);
  };

  const handleAddNew = () => {
    setSelectedUsuario(null);
    setDialogMode('add');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUsuario(null);
  };

  const handleSave = () => {
    // Implementar lógica de salvar
    handleCloseDialog();
  };

  const handleDelete = () => {
    // Implementar lógica de deletar
    handleCloseDialog();
  };

  const paginatedData = usuarios.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(usuarios.length / pageSize);

  return (
    <Box>
      {/* Título e Descrição */}
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestão de Usuários
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
          Administração de usuários e perfis do sistema
        </Typography>
      </Box>

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
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                }
              }}
            >
              Adicionar Usuário
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Total: {usuarios.length} usuários
              </Typography>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                size="small"
                color="primary"
              />
            </Box>
          </Box>

          {/* Tabela de Dados */}
          <TableContainer component={Paper} sx={{ maxHeight: 450 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ backgroundColor: 'rgba(102, 126, 234, 0.1)', fontWeight: 'bold' }}>Nome de Usuário</TableCell>
                  <TableCell sx={{ backgroundColor: 'rgba(102, 126, 234, 0.1)', fontWeight: 'bold', display: { xs: 'none', md: 'table-cell' } }}>Perfil</TableCell>
                  <TableCell sx={{ backgroundColor: 'rgba(102, 126, 234, 0.1)', fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ backgroundColor: 'rgba(102, 126, 234, 0.1)', fontWeight: 'bold' }}>Cadastrado em</TableCell>
                  <TableCell sx={{ backgroundColor: 'rgba(102, 126, 234, 0.1)', fontWeight: 'bold', display: { xs: 'none', md: 'table-cell' } }}>Atualizado em</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((usuario) => (
                  <TableRow
                    key={usuario.id}
                    onClick={() => handleRowClick(usuario)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'rgba(102, 126, 234, 0.04)',
                      },
                    }}
                  >
                    <TableCell>{usuario.username}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{profileLabels[usuario.role]}</TableCell>
                    <TableCell>
                      <Chip
                        label={usuario.isActive ? 'Ativo' : 'Inativo'}
                        color={usuario.isActive ? 'success' : 'error'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{usuario.createdAt ? new Date(usuario.createdAt).toLocaleDateString('pt-BR') : 'N/A'}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{usuario.updatedAt ? new Date(usuario.updatedAt).toLocaleDateString('pt-BR') : 'N/A'}</TableCell>
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
            width: { xs: '95vw', sm: '500px' },
            maxWidth: '500px',
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
          <UsuarioIcon />
          {dialogMode === 'add' ? 'Adicionar Usuário' : 'Editar Usuário'}
        </DialogTitle>

        <DialogContent sx={{
          pt: 3,
          px: 2,
          pb: 1.5
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 }, mt: 2 }}>
            <TextField
              fullWidth
              label="Nome de Usuário"
              defaultValue={selectedUsuario?.username || ''}
              variant="outlined"
              size="small"
              sx={{
                '& .MuiInputBase-root': {
                  padding: '6px 8px'
                },
                '& .MuiInputBase-input': {
                  padding: '6px 0'
                }
              }}
            />
            <FormControl fullWidth variant="outlined" size="small" sx={{
              '& .MuiInputBase-root': {
                padding: '6px 8px'
              },
              '& .MuiSelect-select': {
                padding: '6px 0'
              }
            }}>
              <InputLabel>Perfil</InputLabel>
              <Select
                defaultValue={selectedUsuario?.role || UserProfile.MEDICO}
                label="Perfil"
              >
                <MenuItem value={UserProfile.ADMINISTRADOR}>
                  {profileLabels[UserProfile.ADMINISTRADOR]}
                </MenuItem>
                <MenuItem value={UserProfile.MEDICO}>
                  {profileLabels[UserProfile.MEDICO]}
                </MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth variant="outlined" size="small" sx={{
              '& .MuiInputBase-root': {
                padding: '6px 8px'
              },
              '& .MuiSelect-select': {
                padding: '6px 0'
              }
            }}>
              <InputLabel>Status</InputLabel>
              <Select
                defaultValue={selectedUsuario?.isActive ? "true" : "false"}
                label="Status"
              >
                <MenuItem value="true">Ativo</MenuItem>
                <MenuItem value="false">Inativo</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: { xs: 1, sm: 1.5 } }}>
              <TextField
                fullWidth
                label="Senha"
                type="password"
                variant="outlined"
                size="small"
                placeholder={dialogMode === 'edit' ? 'Deixe em branco para manter atual' : ''}
                sx={{
                  '& .MuiInputBase-root': {
                    padding: '6px 8px'
                  },
                  '& .MuiInputBase-input': {
                    padding: '6px 0'
                  }
                }}
              />
              <TextField
                fullWidth
                label="Confirmar Senha"
                type="password"
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiInputBase-root': {
                    padding: '6px 8px'
                  },
                  '& .MuiInputBase-input': {
                    padding: '6px 0'
                  }
                }}
              />
            </Box>
            {selectedUsuario && (
              <Box sx={{
                display: 'flex',
                gap: 0.5,
                flexWrap: 'wrap',
                mt: 0.5
              }}>
                <Chip
                  label={`ID: ${selectedUsuario.id}`}
                  variant="outlined"
                  size="small"
                  sx={{ fontSize: '0.65rem', height: '20px' }}
                />
                <Chip
                  label={`Perfil: ${profileLabels[selectedUsuario.role]}`}
                  color="primary"
                  variant="outlined"
                  size="small"
                  sx={{ fontSize: '0.65rem', height: '20px' }}
                />
                <Chip
                  label={`Cadastrado: ${selectedUsuario.createdAt ? new Date(selectedUsuario.createdAt).toLocaleDateString('pt-BR') : 'N/A'}`}
                  variant="outlined"
                  size="small"
                  sx={{ fontSize: '0.65rem', height: '20px' }}
                />
                <Chip
                  label={`Atualizado: ${selectedUsuario.updatedAt ? new Date(selectedUsuario.updatedAt).toLocaleDateString('pt-BR') : 'N/A'}`}
                  variant="outlined"
                  size="small"
                  sx={{ fontSize: '0.65rem', height: '20px' }}
                />
                <Chip
                  label={selectedUsuario.isActive ? 'Ativo' : 'Inativo'}
                  color={selectedUsuario.isActive ? 'success' : 'error'}
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
            >
              Excluir
            </Button>
          )}
          <Button
            onClick={handleCloseDialog}
            color="inherit"
            size="small"
            sx={{ fontSize: '0.75rem' }}
          >
            Fechar
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            startIcon={<EditIcon />}
            size="small"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              },
              fontSize: '0.75rem'
            }}
          >
            {dialogMode === 'add' ? 'Adicionar' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsuariosPage;