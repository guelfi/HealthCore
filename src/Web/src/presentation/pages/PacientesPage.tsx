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
} from '@mui/icons-material';
import type { Paciente } from '../../domain/entities/Paciente';
import { usePacientes } from '../hooks/usePacientes';

const PacientesPage: React.FC = () => {
  const { pacientes } = usePacientes();
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(
    null
  );
  const [page, setPage] = useState(1);
  const [pageSize] = useState(7);

  const handleRowClick = (paciente: Paciente) => {
    setSelectedPaciente(paciente);
    setDialogMode('edit');
    setOpenDialog(true);
  };

  const handleAddNew = () => {
    setSelectedPaciente(null);
    setDialogMode('add');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPaciente(null);
  };

  const handleSave = () => {
    // Implementar lógica de salvar
    handleCloseDialog();
  };

  const handleDelete = () => {
    // Implementar lógica de deletar
    handleCloseDialog();
  };

  const paginatedData = pacientes.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(pacientes.length / pageSize);

  return (
    <Box>
      {/* Título e Descrição */}
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestão de Pacientes
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ display: { xs: 'none', md: 'block' } }}
        >
          Cadastro e manutenção de pacientes do sistema
        </Typography>
      </Box>

      {/* Card Principal */}
      <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
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
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background:
                    'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                },
              }}
            >
              Adicionar Paciente
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Total: {pacientes.length} pacientes
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
                  <TableCell
                    sx={{
                      backgroundColor: 'rgba(102, 126, 234, 0.1)',
                      fontWeight: 'bold',
                    }}
                  >
                    Nome
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: 'rgba(102, 126, 234, 0.1)',
                      fontWeight: 'bold',
                    }}
                  >
                    CPF
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: 'rgba(102, 126, 234, 0.1)',
                      fontWeight: 'bold',
                    }}
                  >
                    Data Nascimento
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: 'rgba(102, 126, 234, 0.1)',
                      fontWeight: 'bold',
                    }}
                  >
                    Telefone
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: 'rgba(102, 126, 234, 0.1)',
                      fontWeight: 'bold',
                    }}
                  >
                    Email
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: 'rgba(102, 126, 234, 0.1)',
                      fontWeight: 'bold',
                    }}
                  >
                    Cadastrado em
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map(paciente => (
                  <TableRow
                    key={paciente.id}
                    onClick={() => handleRowClick(paciente)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'rgba(102, 126, 234, 0.04)',
                      },
                    }}
                  >
                    <TableCell>{paciente.nome}</TableCell>
                    <TableCell>{paciente.documento}</TableCell>
                    <TableCell>
                      {new Date(paciente.dataNascimento).toLocaleDateString(
                        'pt-BR'
                      )}
                    </TableCell>
                    <TableCell>{paciente.telefone}</TableCell>
                    <TableCell>{paciente.email}</TableCell>
                    <TableCell>
                      {new Date(paciente.createdAt).toLocaleDateString('pt-BR')}
                    </TableCell>
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
            width: { xs: '95vw', sm: '550px' },
            maxWidth: '550px',
            margin: { xs: 1, sm: 3 },
            maxHeight: { xs: '95vh', sm: '90vh' },
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
          <PersonIcon />
          {dialogMode === 'add' ? 'Adicionar Paciente' : 'Editar Paciente'}
        </DialogTitle>

        <DialogContent sx={{ pt: 4.625, px: 3, pb: 2, overflow: 'auto' }}>
          <Box
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2.625 }}
          >
            <TextField
              fullWidth
              label="Nome Completo"
              defaultValue={selectedPaciente?.nome || ''}
              variant="outlined"
              size="small"
            />
            <TextField
              fullWidth
              label="CPF"
              defaultValue={selectedPaciente?.documento || ''}
              variant="outlined"
              size="small"
            />
            <TextField
              fullWidth
              label="Data de Nascimento"
              type="date"
              defaultValue={
                selectedPaciente?.dataNascimento
                  ? new Date(selectedPaciente.dataNascimento)
                      .toISOString()
                      .split('T')[0]
                  : ''
              }
              variant="outlined"
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Telefone"
              defaultValue={selectedPaciente?.telefone || ''}
              variant="outlined"
              size="small"
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              defaultValue={selectedPaciente?.email || ''}
              variant="outlined"
              size="small"
            />
            <TextField
              fullWidth
              label="Endereço"
              defaultValue={selectedPaciente?.endereco || ''}
              variant="outlined"
              size="small"
              multiline
              rows={2}
            />
            {selectedPaciente && (
              <Box
                sx={{
                  display: 'flex',
                  gap: 0.5,
                  flexWrap: 'wrap',
                  mt: 0.5,
                }}
              >
                <Chip
                  label={`Cadastrado: ${new Date(selectedPaciente.createdAt).toLocaleDateString('pt-BR')}`}
                  variant="outlined"
                  size="small"
                  sx={{ fontSize: '0.65rem', height: '20px' }}
                />
                <Chip
                  label={`Atualizado: ${new Date(selectedPaciente.updatedAt).toLocaleDateString('pt-BR')}`}
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
            onClick={handleSave}
            variant="contained"
            startIcon={<EditIcon />}
            size="small"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              },
              fontSize: '0.75rem',
            }}
          >
            {dialogMode === 'add' ? 'Adicionar' : 'Salvar'}
          </Button>
          <Button
            onClick={handleCloseDialog}
            color="inherit"
            size="small"
            sx={{ fontSize: '0.75rem' }}
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PacientesPage;
