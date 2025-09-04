import React from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ExameForm from '../components/common/ExameForm';

const ExameAddPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSaveSuccess = () => {
    navigate('/exames');
  };

  const handleCancel = () => {
    navigate('/exames');
  };

  return (
    <Box sx={{ p: 3 }}>
      <ExameForm
        mode="add"
        onSaveSuccess={handleSaveSuccess}
        onCancel={handleCancel}
      />
    </Box>
  );
};

export default ExameAddPage;
