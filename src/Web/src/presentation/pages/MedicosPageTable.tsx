import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalHospital as MedicoIcon,
  Visibility,
} from '@mui/icons-material';
import { mockUsuarios } from '../../application/stores/mockData';
import { UserProfile } from '../../domain/enums/UserProfile';
import type { Usuario } from '../../domain/entities/Usuario';

const MedicosPageTable: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [medicos] = useState<Usuario[]>(
    mockUsuarios.filter(u => u.role === UserProfile.MEDICO)
  );
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedMedico, setSelectedMedico] = useState<Usuario | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(7);

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
              Adicionar Médico
            </Button>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                Total: {medicos.length}
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
          <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider', maxHeight: 450 }}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: 'rgba(102, 126, 234, 0.1)' }}>
                <TableRow>
                  <TableCell align="center" sx={{ width: 50 }}></TableCell>
                  <TableCell><strong>Nome Médico</strong></TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}><strong>Perfil</strong></TableCell>
                  <TableCell><strong>Situação</strong></TableCell>
                  <TableCell><strong>Cadastrado</strong></TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}><strong>Atualizado</strong></TableCell>
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
                        backgroundColor: 'rgba(102, 126, 234, 0.04)' 
                      }
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
                    <TableCell>{medico.username}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Médico</TableCell>
                    <TableCell>
                      <Chip
                        label={medico.isActive ? 'Ativo' : 'Inativo'}
                        color={medico.isActive ? 'success' : 'error'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{medico.createdAt ? new Date(medico.createdAt).toLocaleDateString('pt-BR') : '-'}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{medico.updatedAt ? new Date(medico.updatedAt).toLocaleDateString('pt-BR') : '-'}</TableCell>
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
        
        <DialogContent sx={{ pt: 1, px: 1.5, pb: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1, sm: 1.2 }, mt: 1 }}>
            <TextField
              fullWidth
              label="Nome Médico"
              defaultValue={selectedMedico?.username || ''}
              variant="outlined"
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
                label="Senha"
                type="password"
                variant="outlined"
                size="small"
                placeholder={dialogMode === 'edit' ? 'Deixe em branco para manter atual' : ''}
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
                label="Confirmar Senha"
                type="password"
                variant="outlined"
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
            <FormControl fullWidth variant="outlined" size="small" sx={{
              '& .MuiInputBase-root': {
                padding: '6px 8px'
              },
              '& .MuiSelect-select': {
                padding: '6px 0'
              }
            }}>
              <InputLabel>Situação</InputLabel>
              <Select
                defaultValue={selectedMedico?.isActive ?? true}
                label="Situação"
              >
                <MenuItem value="true">Ativo</MenuItem>
                <MenuItem value="false">Inativo</MenuItem>
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
                  label={`Cadastrado: ${selectedMedico.createdAt ? new Date(selectedMedico.createdAt).toLocaleDateString('pt-BR') : '-'}`}
                  variant="outlined"
                  size="small"
                  sx={{ fontSize: '0.65rem', height: '20px' }}
                />
                <Chip 
                  label={`Atualizado: ${selectedMedico.updatedAt ? new Date(selectedMedico.updatedAt).toLocaleDateString('pt-BR') : '-'}`}
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

export default MedicosPageTable;
