import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  TextField,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {
  Visibility,
  MedicalServices,
} from '@mui/icons-material';
import { useEspecialidades } from '../../hooks/useEspecialidades';
import type { Especialidade } from '../../../domain/entities';
import { useAuthStore } from '../../../application/stores/authStore';
import { UserProfile } from '../../../domain/enums/UserProfile';
import EspecialidadeDeleteDialog from '../../components/especialidades/EspecialidadeDeleteDialog';
import EspecialidadeViewDialog from '../../components/especialidades/EspecialidadeViewDialog';
import {
  standardCardStyles,
  standardCardContentStyles,
  standardDialogTitleStyles,
  standardDialogPaperStyles,
  standardDialogContentStyles,
} from '../../styles/cardStyles';
import StandardDialogButtons from '../../components/common/StandardDialogButtons';
import CustomPagination from '../../components/common/CustomPagination';
import ResponsiveTableHeader from '../../../components/ui/Layout/ResponsiveTableHeader';
import MobileOptimizedTable from '../../../components/ui/Table/MobileOptimizedTable';

const EspecialidadesPageTable: React.FC = () => {
  const { user } = useAuthStore();
  const canManageEspecialidades = user?.role === UserProfile.ADMINISTRADOR;

  const {
    especialidades,
    loading,
    error,
    totalItems,
    totalPages,
    currentPage,
    pageSize,
    filter,
    setFilter,
    createEspecialidade,
    updateEspecialidade,
    deleteEspecialidade,
    refresh,
  } = useEspecialidades();

  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedEspecialidade, setSelectedEspecialidade] = useState<Especialidade | null>(null);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    ativa: true,
  });

  const handleRowClick = (especialidade: Especialidade) => {
    setSelectedEspecialidade(especialidade);

    if (!canManageEspecialidades) {
      setOpenViewDialog(true);
      return;
    }

    setFormData({
      nome: especialidade.nome,
      descricao: especialidade.descricao || '',
      ativa: especialidade.ativa,
    });
    setDialogMode('edit');
    setOpenDialog(true);
  };

  const handleAddNew = () => {
    if (!canManageEspecialidades) return;

    setSelectedEspecialidade(null);
    setFormData({
      nome: '',
      descricao: '',
      ativa: true,
    });
    setDialogMode('add');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEspecialidade(null);
    setSaving(false);
  };

  const handleSave = async () => {
    if (!canManageEspecialidades) return;

    setSaving(true);
    try {
      if (dialogMode === 'add') {
        await createEspecialidade(formData);
      } else if (selectedEspecialidade) {
        await updateEspecialidade(selectedEspecialidade.id, formData);
      }
      handleCloseDialog();
      await refresh();
    } catch (error) {
      console.error('Erro ao salvar especialidade:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = () => {
    if (canManageEspecialidades) {
      setOpenDeleteDialog(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEspecialidade || !canManageEspecialidades) return;

    setSaving(true);
    try {
      await deleteEspecialidade(selectedEspecialidade.id);
      setOpenDeleteDialog(false);
      handleCloseDialog();
      await refresh();
    } catch (error) {
      console.error('Erro ao deletar especialidade:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilter({ ...filter, page: newPage, pageSize: 10 });
  };

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
      id: 'nome',
      label: 'Nome',
      minWidth: 140,
      width: 155,
      mobileVisible: true,
      tabletVisible: true,
      desktopVisible: true,
    },
    {
      id: 'descricao',
      label: 'Descrição',
      minWidth: 500,
      width: 560,
      mobileVisible: true,
      tabletVisible: true,
      desktopVisible: true,
      render: (value: unknown) => String(value || '-'),
    },
    {
      id: 'ativa',
      label: 'Status',
      minWidth: 80,
      width: 86,
      mobileVisible: false,
      tabletVisible: true,
      desktopVisible: true,
      render: (value: unknown) => (
        <Chip
          label={value ? 'Ativa' : 'Inativa'}
          color={value ? 'success' : 'default'}
          size="small"
        />
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestão de Especialidades
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ display: { xs: 'none', md: 'block' } }}
        >
          Cadastro e manutenção de especialidades médicas
        </Typography>
      </Box>

      <Card sx={standardCardStyles}>
        <CardContent sx={standardCardContentStyles}>
          <ResponsiveTableHeader
            onAddClick={handleAddNew}
            addButtonText="Adicionar Especialidade"
            addButtonDisabled={loading || saving}
            showAddButton={canManageEspecialidades}
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
            itemName="especialidades"
            showTotalOnMobile={false}
            fabTooltip="Adicionar Especialidade"
          />

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading && (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          )}

          {!loading && (
            <MobileOptimizedTable
              columns={tableColumns}
              data={especialidades}
              onRowClick={handleRowClick}
              loading={loading}
              emptyMessage="Nenhuma especialidade encontrada"
              rowHeight={36}
              minRows={10}
              stickyHeader
              touchOptimized
            />
          )}
        </CardContent>
      </Card>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth={false}
        PaperProps={{ sx: standardDialogPaperStyles }}
      >
        <DialogTitle sx={standardDialogTitleStyles}>
          <MedicalServices />
          {dialogMode === 'add' ? 'Adicionar Especialidade' : 'Editar Especialidade'}
        </DialogTitle>

        <DialogContent sx={standardDialogContentStyles}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
            <TextField
              fullWidth
              label="Nome da Especialidade"
              value={formData.nome}
              onChange={e => handleInputChange('nome', e.target.value)}
              variant="outlined"
              size="small"
              required
            />
            <TextField
              fullWidth
              label="Descrição"
              value={formData.descricao}
              onChange={e => handleInputChange('descricao', e.target.value)}
              variant="outlined"
              size="small"
              multiline
              rows={3}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.ativa}
                  onChange={e => handleInputChange('ativa', e.target.checked)}
                />
              }
              label="Especialidade Ativa"
            />
            {selectedEspecialidade && (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                <Chip
                  label={`ID: ${selectedEspecialidade.id}`}
                  variant="outlined"
                  size="small"
                  sx={{ fontSize: '0.65rem', height: '20px' }}
                />
                <Chip
                  label={`Criada em: ${new Date(selectedEspecialidade.dataCriacao).toLocaleDateString('pt-BR')}`}
                  variant="outlined"
                  size="small"
                  sx={{ fontSize: '0.65rem', height: '20px' }}
                />
              </Box>
            )}
          </Box>
        </DialogContent>

        <StandardDialogButtons
          onSave={handleSave}
          onClose={handleCloseDialog}
          onDelete={dialogMode === 'edit' ? handleDeleteClick : undefined}
          showDelete={dialogMode === 'edit'}
          saveLoading={saving}
          saveText={dialogMode === 'add' ? 'Adicionar' : 'Salvar'}
        />
      </Dialog>

      <EspecialidadeViewDialog
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        especialidade={selectedEspecialidade}
      />

      <EspecialidadeDeleteDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        especialidade={selectedEspecialidade}
      />
    </Box>
  );
};

export default EspecialidadesPageTable;
