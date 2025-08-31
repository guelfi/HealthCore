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
  Autocomplete,
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
  Assignment as ExameIcon,
} from '@mui/icons-material';
import { mockExames, mockPacientes } from '../../application/stores/mockData';
import { ModalidadeDicom } from '../../domain/enums/ModalidadeDicom';
import type { Exame } from '../../domain/entities/Exame';
import type { Paciente } from '../../domain/entities/Paciente';

const ExamesPage: React.FC = () => {
  const [exames] = useState<Exame[]>(mockExames);
  const [pacientes] = useState<Paciente[]>(mockPacientes);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedExame, setSelectedExame] = useState<Exame | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const modalidadeLabels = {
    [ModalidadeDicom.CR]: 'Radiografia Computadorizada (CR)',
    [ModalidadeDicom.CT]: 'Tomografia (CT)',
    [ModalidadeDicom.DX]: 'Radiografia Digital (DX)',
    [ModalidadeDicom.MG]: 'Mamografia (MG)',
    [ModalidadeDicom.MR]: 'Ressonância (MR)',
    [ModalidadeDicom.NM]: 'Medicina Nuclear (NM)',
    [ModalidadeDicom.OT]: 'Outros (OT)',
    [ModalidadeDicom.PT]: 'Tomografia por Emissão de Pósitrons (PT)',
    [ModalidadeDicom.RF]: 'Radiofluoroscopia (RF)',
    [ModalidadeDicom.US]: 'Ultrassom (US)',
    [ModalidadeDicom.XA]: 'Angiografia por Raios-X (XA)',
  };

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

  const handleSave = () => {
    // Implementar lógica de salvar
    handleCloseDialog();
  };

  const handleDelete = () => {
    // Implementar lógica de deletar
    handleCloseDialog();
  };

  const paginatedData = exames.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(exames.length / pageSize);

  return (
    <Box>
      {/* Título e Descrição */}
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestão de Exames
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
          Cadastro e manutenção de exames médicos
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
              Adicionar Exame
            </Button>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Total: {exames.length} exames
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
                  <TableCell sx={{ backgroundColor: 'rgba(102, 126, 234, 0.1)', fontWeight: 'bold' }}>Paciente</TableCell>
                  <TableCell sx={{ backgroundColor: 'rgba(102, 126, 234, 0.1)', fontWeight: 'bold', display: { xs: 'none', md: 'table-cell' } }}>Modalidade</TableCell>
                  <TableCell sx={{ backgroundColor: 'rgba(102, 126, 234, 0.1)', fontWeight: 'bold', display: { xs: 'none', lg: 'table-cell' } }}>Descrição</TableCell>
                  <TableCell sx={{ backgroundColor: 'rgba(102, 126, 234, 0.1)', fontWeight: 'bold' }}>Data do Exame</TableCell>
                  <TableCell sx={{ backgroundColor: 'rgba(102, 126, 234, 0.1)', fontWeight: 'bold', display: { xs: 'none', md: 'table-cell' } }}>Cadastrado em</TableCell>
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
                        backgroundColor: 'rgba(102, 126, 234, 0.04)',
                      },
                    }}
                  >
                    <TableCell>{exame.paciente?.nome || 'N/A'}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{modalidadeLabels[exame.modalidade] || exame.modalidade}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>{exame.descricao}</TableCell>
                    <TableCell>{new Date(exame.dataExame).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{new Date(exame.createdAt).toLocaleDateString('pt-BR')}</TableCell>
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2.625 }}>
            <Autocomplete
              options={pacientes}
              getOptionLabel={(option) => option.nome}
              defaultValue={selectedExame?.paciente || null}
              size="small"
              renderInput={(params) => (
                <TextField {...params} label="Paciente" variant="outlined" size="small" />
              )}
            />
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Modalidade</InputLabel>
              <Select
                defaultValue={selectedExame?.modalidade || ''}
                label="Modalidade"
              >
                {Object.entries(modalidadeLabels).map(([key, label]) => (
                  <MenuItem key={key} value={key}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Descrição do Exame"
              defaultValue={selectedExame?.descricao || ''}
              variant="outlined"
              size="small"
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              label="Data do Exame"
              type="date"
              defaultValue={selectedExame?.dataExame ? 
                new Date(selectedExame.dataExame).toISOString().split('T')[0] : ''}
              variant="outlined"
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Chave de Idempotência"
              defaultValue={selectedExame?.idempotencyKey || ''}
              variant="outlined"
              size="small"
              helperText="Identificador único"
            />
            {selectedExame && (
              <Box sx={{ 
                display: 'flex', 
                gap: 0.5, 
                flexWrap: 'wrap',
                mt: 0.5
              }}>
                <Chip 
                  label={`ID: ${selectedExame.id}`}
                  variant="outlined"
                  size="small"
                  sx={{ fontSize: '0.65rem', height: '20px' }}
                />
                <Chip 
                  label={`Cadastrado: ${new Date(selectedExame.createdAt).toLocaleDateString('pt-BR')}`}
                  variant="outlined"
                  size="small"
                  sx={{ fontSize: '0.65rem', height: '20px' }}
                />
                <Chip 
                  label={`Atualizado: ${new Date(selectedExame.updatedAt).toLocaleDateString('pt-BR')}`}
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

export default ExamesPage;