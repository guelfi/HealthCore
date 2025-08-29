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
  LocalHospital as MedicoIcon,
} from '@mui/icons-material';
import { mockUsuarios } from '../../application/stores/mockData';
import { UserProfile } from '../../domain/enums/UserProfile';
import type { Usuario } from '../../domain/entities/Usuario';

const MedicosPage: React.FC = () => {
  const [medicos] = useState<Usuario[]>(
    mockUsuarios.filter(u => u.role === UserProfile.MEDICO)
  );
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedMedico, setSelectedMedico] = useState<Usuario | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const handleRowClick = (medico: Usuario) => {
    setSelectedMedico(medico);
    setDialogMode('edit');
    setOpenDialog(true);
  };

  const handleAddNew = () => {
    setSelectedMedico(null);
    setDialogMode('add');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMedico(null);
  };

  const handleSave = () => {
    // Implementar lógica de salvar
    handleCloseDialog();
  };

  const handleDelete = () => {
    // Implementar lógica de deletar
    handleCloseDialog();
  };

  const paginatedData = medicos.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(medicos.length / pageSize);

  return (
    <Box>
      {/* Título e Descrição */}
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestão de Médicos
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
          Cadastro e manutenção de médicos do sistema
        </Typography>
      </Box>

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
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                }
              }}
            >
              Adicionar Médico
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Total: {medicos.length} médicos
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
                  <TableCell sx={{ backgroundColor: 'rgba(102, 126, 234, 0.1)', fontWeight: 'bold' }}>Nome Médico</TableCell>
                  <TableCell sx={{ backgroundColor: 'rgba(102, 126, 234, 0.1)', fontWeight: 'bold' }}>Perfil</TableCell>
                  <TableCell sx={{ backgroundColor: 'rgba(102, 126, 234, 0.1)', fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ backgroundColor: 'rgba(102, 126, 234, 0.1)', fontWeight: 'bold' }}>Cadastrado em</TableCell>
                  <TableCell sx={{ backgroundColor: 'rgba(102, 126, 234, 0.1)', fontWeight: 'bold' }}>Atualizado em</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((medico) => (
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
                    <TableCell>{medico.username}</TableCell>
                    <TableCell>Médico</TableCell>
                    <TableCell>
                      <Chip
                        label={medico.isActive ? 'Ativo' : 'Inativo'}
                        color={medico.isActive ? 'success' : 'error'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{new Date(medico.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{new Date(medico.updatedAt).toLocaleDateString('pt-BR')}</TableCell>
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
          <MedicoIcon />
          {dialogMode === 'add' ? 'Adicionar Médico' : 'Editar Médico'}
        </DialogTitle>

        <DialogContent sx={{
          pt: 4,
          px: 3,
          pb: 2
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Nome Médico"
              defaultValue={selectedMedico?.username || ''}
              variant="outlined"
              size="small"
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                label="Senha"
                type="password"
                variant="outlined"
                size="small"
                placeholder={dialogMode === 'edit' ? 'Deixe em branco para manter atual' : ''}
              />
              <TextField
                fullWidth
                label="Confirmar Senha"
                type="password"
                variant="outlined"
                size="small"
              />
            </Box>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Status</InputLabel>
              <Select
                defaultValue={selectedMedico?.isActive ?? true}
                label="Status"
              >
                <MenuItem value={true}>Ativo</MenuItem>
                <MenuItem value={false}>Inativo</MenuItem>
              </Select>
            </FormControl>
            {selectedMedico && (
              <Box sx={{
                display: 'flex',
                gap: 0.5,
                flexWrap: 'wrap',
                mt: 0.5
              }}>
                <Chip
                  label={`Cadastrado: ${new Date(selectedMedico.createdAt).toLocaleDateString('pt-BR')}`}
                  variant="outlined"
                  size="small"
                  sx={{ fontSize: '0.65rem', height: '20px' }}
                />
                <Chip
                  label={`Atualizado: ${new Date(selectedMedico.updatedAt).toLocaleDateString('pt-BR')}`}
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
            Cancelar
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

export default MedicosPage;