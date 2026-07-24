import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  standardCardStyles,
  standardCardContentStyles,
  standardDialogTitleStyles,
  standardDialogPaperStyles,
  standardDialogContentStyles,
} from '../../styles/cardStyles';
import { formatDateBR } from '../../utils/dateUtils';
import {
  Assignment as ExameIcon,
  Visibility,
} from '@mui/icons-material';
import { useExames, usePacientes } from '../../hooks';
import type { Exame } from '../../../domain/entities/Exame';
import type { Paciente } from '../../../domain/entities/Paciente';
import { ModalidadeDicomLabels } from '../../../domain/enums/ModalidadeDicom';
import ExameForm from '../../components/common/ExameForm';
import CustomPagination from '../../components/common/CustomPagination';
import ResponsiveTableHeader from '../../../components/ui/Layout/ResponsiveTableHeader';
import MobileOptimizedTable from '../../../components/ui/Table/MobileOptimizedTable';
import {
  DeleteConfirmationDialog,
  SuccessDialog,
} from '../../components/common/ConfirmationDialogs';
import { useUIStore } from '../../../application/stores/uiStore';

const ExamesPageTable: React.FC = () => {
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
  const [pageSize] = useState(10);

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
    } catch (error: unknown) {
      console.error('Erro ao excluir exame:', error);
      addNotification(error instanceof Error ? error.message : 'Erro ao excluir exame', 'error');
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

  const tableData = paginatedData.map(exame => ({
    ...exame,
    pacienteNome: getPacienteName(exame.pacienteId),
    modalidadeLabel: ModalidadeDicomLabels[exame.modalidade] || exame.modalidade,
    dataExameFormatada: formatDateBR(exame.dataExame),
    createdAtFormatada: formatDateBR(exame.createdAt),
  }));

  const tableColumns = [
    {
      id: 'actions',
      label: '',
      minWidth: 44,
      width: 44,
      align: 'center' as const,
      mobileVisible: true,
      render: () => (
        <Visibility
          color="action"
          sx={{
            fontSize: '1.3rem',
            cursor: 'pointer',
            '&:hover': { color: 'primary.main' },
          }}
        />
      ),
    },
    {
      id: 'pacienteNome',
      label: 'Paciente',
      minWidth: 155,
      width: 165,
      mobileVisible: true,
      tabletVisible: true,
      desktopVisible: true,
    },
    {
      id: 'modalidadeLabel',
      label: 'Modalidade',
      minWidth: 240,
      width: 255,
      mobileVisible: false,
      tabletVisible: true,
      desktopVisible: true,
    },
    {
      id: 'descricao',
      label: 'Descrição',
      minWidth: 90,
      width: 100,
      mobileVisible: false,
      tabletVisible: false,
      desktopVisible: true,
      render: (value: unknown) => String(value || '-'),
    },
    {
      id: 'dataExameFormatada',
      label: 'Data do Exame',
      minWidth: 130,
      width: 135,
      mobileVisible: true,
      tabletVisible: true,
      desktopVisible: true,
    },
    {
      id: 'createdAtFormatada',
      label: 'Cadastrado em',
      minWidth: 125,
      width: 130,
      mobileVisible: false,
      tabletVisible: true,
      desktopVisible: true,
    },
  ];

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
            <MobileOptimizedTable
              columns={tableColumns}
              data={tableData}
              onRowClick={handleRowClick}
              loading={loading}
              emptyMessage="Nenhum exame encontrado"
              rowHeight={36}
              minRows={10}
              stickyHeader
              touchOptimized
            />
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
          '& .MuiDialog-paper': standardDialogPaperStyles,
        }}
      >
        <DialogTitle sx={standardDialogTitleStyles}>
          <ExameIcon />
          {dialogMode === 'add' ? 'Adicionar Exame' : 'Editar Exame'}
        </DialogTitle>

        <DialogContent sx={[standardDialogContentStyles, { position: 'relative' }]}>
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
