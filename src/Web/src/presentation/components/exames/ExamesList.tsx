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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Edit,
  Delete,
  Search,
  Add,
  Assignment,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { mockExames } from '../../../application/stores/mockData';
import { Exame } from '../../../domain/entities/Exame';
import { ModalidadeDicom, ModalidadeDicomLabels } from '../../../domain/enums/ModalidadeDicom';
import { useUIStore } from '../../../application/stores/uiStore';

const ExamesList: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useUIStore();
  
  const [exames] = React.useState<Exame[]>(mockExames);
  const [filteredExames, setFilteredExames] = React.useState<Exame[]>(mockExames);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [modalidadeFilter, setModalidadeFilter] = React.useState<string>('');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [loading] = React.useState(false);

  React.useEffect(() => {
    let filtered = exames.filter(exame =>
      exame.paciente?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exame.paciente?.documento.includes(searchTerm) ||
      exame.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (modalidadeFilter) {
      filtered = filtered.filter(exame => exame.modalidade === modalidadeFilter);
    }

    setFilteredExames(filtered);
    setPage(0);
  }, [searchTerm, modalidadeFilter, exames]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleModalidadeFilterChange = (event: any) => {
    setModalidadeFilter(event.target.value);
  };

  const handleEdit = (exame: Exame) => {
    navigate(`/exames/editar/${exame.id}`);
  };

  const handleDelete = (exame: Exame) => {
    // Mock delete - in real app, would show confirmation dialog
    addNotification(`Exame removido com sucesso`, 'success');
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedExames = filteredExames.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getModalidadeColor = (modalidade: ModalidadeDicom) => {
    const colors: Record<ModalidadeDicom, 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
      [ModalidadeDicom.CR]: 'info',
      [ModalidadeDicom.CT]: 'primary',
      [ModalidadeDicom.DX]: 'warning', // Changed from XR
      [ModalidadeDicom.MG]: 'primary',
      [ModalidadeDicom.MR]: 'secondary',
      [ModalidadeDicom.NM]: 'secondary',
      [ModalidadeDicom.OT]: 'error', // New modality
      [ModalidadeDicom.PT]: 'success',
      [ModalidadeDicom.RF]: 'warning',
      [ModalidadeDicom.US]: 'success',
      [ModalidadeDicom.XA]: 'info', // New modality
    };
    return colors[modalidade] || 'default';
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
                    {modalidade}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Paciente</TableCell>
                  <TableCell>CPF</TableCell>
                  <TableCell>Modalidade</TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell>Data do Exame</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedExames.map((exame) => (
                  <TableRow key={exame.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Assignment color="action" />
                        {exame.paciente?.nome}
                      </Box>
                    </TableCell>
                    <TableCell>{exame.paciente?.cpf}</TableCell>
                    <TableCell>
                      <Chip
                        label={exame.modalidade}
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
                {paginatedExames.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        {searchTerm || modalidadeFilter ? 'Nenhum exame encontrado' : 'Nenhum exame cadastrado'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredExames.length}
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

export default ExamesList;