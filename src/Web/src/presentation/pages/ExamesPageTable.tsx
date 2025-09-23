import React, { useState, useEffect } from 'react';
import {
  useTheme,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  standardCardStyles,
  standardCardContentStyles,
  standardDialogTitleStyles,
  standardAddButtonStyles,
} from '../styles/cardStyles';
import { formatDateBR } from '../utils/dateUtils';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  Add as AddIcon,
  Assignment as ExameIcon,
  Visibility,
} from '@mui/icons-material';
import { useExames, usePacientes } from '../hooks';
import type { Exame } from '../../domain/entities/Exame';
import type { Paciente } from '../../domain/entities/Paciente';
import { ModalidadeDicomLabels } from '../../domain/enums/ModalidadeDicom';
import ExameForm from '../components/common/ExameForm';
import CustomPagination from '../components/common/CustomPagination';
import ResponsiveTableHeader from '../../components/ui/Layout/ResponsiveTableHeader';
import {
  DeleteConfirmationDialog,
  SuccessDialog,
} from '../components/common/ConfirmationDialogs';
import { useUIStore } from '../../application/stores/uiStore';

const ExamesPageTable: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { addNotification } = useUIStore();

  // Hooks para exames e pacientes
  const {
    exames,
    total,
    currentPage,
    totalPages,
    loading,
    error,
    fetchExames,
    deleteExame,
  } = useExames();

  const { pacientes: allPacientes, fetchPacientes } = usePacientes();

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedExame, setSelectedExame] = useState<Exame | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState({
    title: '',
    message: '',
  });
  const [saving, setSaving] = useState(false);
  const [pageSize] = useState(7);

  // Carregar exames e pacientes ao montar o componente
  useEffect(() => {
    fetchExames({ page: 1, pageSize });
    fetchPacientes({ page: 1, pageSize: 100 }); // Carregar todos os pacientes
  }, [fetchExames, fetchPacientes, pageSize]);

  const handleRowClick = (exame: Exame) => {
    // Mostrar loading se já há um exame selecionado (mudança de seleção)
    if (selectedExame && selectedExame.id !== exame.id) {
      setSaving(true);
      // Simular um pequeno delay para mostrar o loading
      setTimeout(() => {
        setSelectedExame(exame);
        setDialogMode('edit');
        setOpenDialog(true);
        setSaving(false);
      }, 300);
    } else {
      setSelectedExame(exame);
      setDialogMode('edit');
      setOpenDialog(true);
    }
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

  const handlePageChange = (newPage: number) => {
    fetchExames({ page: newPage, pageSize });
  };

  const handleSaveSuccess = () => {
    handleCloseDialog();
    // Recarregar a lista de exames
    fetchExames({ page: currentPage, pageSize });
  };

  const handleDelete = async () => {
    if (!selectedExame) return;

    setSaving(true);
    try {
      await deleteExame(selectedExame.id);
      const pacienteNome =
        allPacientes.find(p => p.id === selectedExame.pacienteId)?.nome ||
        'paciente';
      setSuccessMessage({
        title: 'Sucesso!',
        message: `Exame de ${pacienteNome} foi excluído com sucesso.`,
      });
      setShowDeleteDialog(false);
      handleCloseDialog(); // Fechar o dialog principal de edição
      setShowSuccessDialog(true);
      fetchExames({ page: currentPage, pageSize }); // Recarregar lista
    } catch (error: any) {
      console.error('Erro ao excluir exame:', error);
      addNotification(error.message || 'Erro ao excluir exame', 'error');
    } finally {
      setSaving(false);
    }
  };

  const paginatedData = exames;
  const totalItems = total;

  // Obter nome do paciente pelo ID
  const getPacienteName = (pacienteId: string) => {
    const paciente = allPacientes.find(p => p.id === pacienteId);
    return paciente ? paciente.nome : 'N/A';
  };

  return (
    <>
      {/* Título e Descrição */}
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestão de Exames
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ display: { xs: 'none', md: 'block' } }}
        >
          Cadastro e manutenção de exames médicos
        </Typography>
      </Box>

      {/* Mensagem de erro */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Card Principal */}
      <Card sx={standardCardStyles}>
        <CardContent sx={standardCardContentStyles}>
          {/* Header Responsivo com FAB Mobile */}
          <ResponsiveTableHeader
            onAddClick={handleAddNew}
            addButtonText="Adicionar Exame"
            addButtonDisabled={loading}
            paginationComponent={
              <CustomPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={pageSize}
                onPageChange={handlePageChange}
                size="small"
              />
            }
            totalItems={totalItems}
            itemName="exames"
            showTotalOnMobile={false}
            fabTooltip="Adicionar Exame"
          />

          {/* Estado de carregamento */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Tabela de Dados */}
          {!loading && (
            <TableContainer
              component={Paper}
              sx={{
                boxShadow: 'none',
                border: '1px solid',
                borderColor: 'divider',
                maxHeight: 450,
              }}
            >
              <Table size="small">
                <TableHead sx={{ backgroundColor: 'rgba(102, 126, 234, 0.1)' }}>
                  <TableRow>
                    <TableCell align="center" sx={{ width: 50 }}></TableCell>
                    <TableCell>
                      <strong>Paciente</strong>
                    </TableCell>
                    <TableCell
                      sx={{ display: { xs: 'none', md: 'table-cell' } }}
                    >
                      <strong>Modalidade</strong>
                    </TableCell>
                    <TableCell
                      sx={{ display: { xs: 'none', lg: 'table-cell' } }}
                    >
                      <strong>Descrição</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Data do Exame</strong>
                    </TableCell>
                    <TableCell
                      sx={{ display: { xs: 'none', md: 'table-cell' }, py: 1 }}
                    >
                      <strong>Cadastrado em</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.map(exame => (
                    <TableRow
                      key={exame.id}
                      onClick={() => handleRowClick(exame)}
                      sx={{
                        cursor: 'pointer',
                        height: 31,
                        '&:hover': {
                          backgroundColor: 'rgba(102, 126, 234, 0.04)',
                        },
                      }}
                    >
                      <TableCell align="center" sx={{ py: '1px' }}>
                        <Visibility
                          color="action"
                          sx={{
                            fontSize: '1.1rem',
                            cursor: 'pointer',
                            '&:hover': { color: 'primary.main' },
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: '1px' }}>
                        {getPacienteName(exame.pacienteId)}
                      </TableCell>
                      <TableCell
                        sx={{
                          display: { xs: 'none', md: 'table-cell' },
                          py: '1px',
                        }}
                      >
                        {ModalidadeDicomLabels[exame.modalidade] ||
                          exame.modalidade}
                      </TableCell>
                      <TableCell
                        sx={{
                          display: { xs: 'none', lg: 'table-cell' },
                          py: '1px',
                        }}
                      >
                        {exame.descricao || '-'}
                      </TableCell>
                      <TableCell sx={{ py: '1px' }}>
                        {formatDateBR(exame.dataExame)}
                      </TableCell>
                      <TableCell
                        sx={{
                          display: { xs: 'none', md: 'table-cell' },
                          py: '1px',
                        }}
                      >
                        {formatDateBR(exame.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedData.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography
                          variant="body1"
                          color="text.secondary"
                          sx={{ py: 4 }}
                        >
                          Nenhum exame encontrado
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Manutenção */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth={false}
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            width: { xs: '95vw', sm: '550px' },
            maxWidth: '550px',
            margin: { xs: 1, sm: 3 },
            minHeight: { xs: 'auto', sm: 'auto' },
          },
        }}
      >
        <DialogTitle sx={standardDialogTitleStyles}>
          <ExameIcon />
          {dialogMode === 'add' ? 'Adicionar Exame' : 'Editar Exame'}
        </DialogTitle>

        <DialogContent
          sx={{
            pt: 4.625,
            px: 3,
            pb: 2,
            position: 'relative',
          }}
        >
          {saving && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                zIndex: 1000,
              }}
            >
              <CircularProgress />
            </Box>
          )}
          <ExameForm
            mode={dialogMode}
            initialData={selectedExame}
            onSaveSuccess={handleSaveSuccess}
            onCancel={handleCloseDialog}
            onDelete={
              dialogMode === 'edit' && selectedExame
                ? () => setShowDeleteDialog(true)
                : undefined
            }
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        itemName={
          selectedExame
            ? `exame de ${allPacientes.find((p: Paciente) => p.id === selectedExame.pacienteId)?.nome || 'paciente'}`
            : ''
        }
        itemType="o"
        loading={saving}
      />

      {/* Diálogo de Sucesso */}
      <SuccessDialog
        open={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        title={successMessage.title}
        message={successMessage.message}
      />
    </>
  );
};

export default ExamesPageTable;
