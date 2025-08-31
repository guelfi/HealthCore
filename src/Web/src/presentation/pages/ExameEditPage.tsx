import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { ExameService } from '../../application/services/ExameService';
import type { Exame } from '../../domain/entities/Exame';
import ExameForm from '../components/exames/ExameForm';

const ExameEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [exame, setExame] = useState<Exame | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExame = async () => {
      if (!id) {
        setError('ID do exame não fornecido');
        setLoading(false);
        return;
      }

      try {
        const data = await ExameService.getById(id);
        setExame(data);
      } catch (err) {
        console.error('Erro ao carregar exame:', err);
        setError('Erro ao carregar exame');
      } finally {
        setLoading(false);
      }
    };

    fetchExame();
  }, [id]);

  const handleSaveSuccess = () => {
    navigate('/exames');
  };

  const handleCancel = () => {
    navigate('/exames');
  };

  const handleDelete = async (exameId: string) => {
    try {
      await ExameService.delete(exameId);
      navigate('/exames');
    } catch (err) {
      console.error('Erro ao deletar exame:', err);
      // Handle error appropriately
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!exame) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Exame não encontrado</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <ExameForm
        mode="edit"
        initialData={exame}
        onSaveSuccess={handleSaveSuccess}
        onCancel={handleCancel}
        onDelete={handleDelete}
      />
    </Box>
  );
};

export default ExameEditPage;