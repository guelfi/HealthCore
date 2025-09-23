import React from 'react';
import {
  Box,
  Button,
  Typography,
  useTheme,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useResponsive } from '../../../presentation/hooks/useResponsive';
import MobileAddFab from '../Button/MobileAddFab';

interface ResponsiveTableHeaderProps {
  // Add button props
  onAddClick: () => void;
  addButtonText: string;
  addButtonIcon?: React.ReactNode;
  addButtonDisabled?: boolean;
  addButtonLoading?: boolean;
  
  // Pagination props
  paginationComponent: React.ReactNode;
  
  // Additional info
  totalItems?: number;
  itemName?: string; // e.g., "pacientes", "médicos"
  
  // Layout customization
  showTotalOnMobile?: boolean;
  fabTooltip?: string;
  
  // FAB positioning
  fabRelativeToTable?: boolean;
  tableContainerRef?: React.RefObject<HTMLElement>;
}

const ResponsiveTableHeader: React.FC<ResponsiveTableHeaderProps> = ({
  onAddClick,
  addButtonText,
  addButtonIcon = <AddIcon />,
  addButtonDisabled = false,
  addButtonLoading = false,
  paginationComponent,
  totalItems,
  itemName,
  showTotalOnMobile = false,
  fabTooltip,
  fabRelativeToTable = false,
  tableContainerRef,
}) => {
  const theme = useTheme();
  const { isMobile, isTablet } = useResponsive();
  
  // Determinar se deve usar FAB
  const useFab = isMobile || (isTablet && !showTotalOnMobile);

  return (
    <>
      {/* Header Layout Desktop/Tablet */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexDirection: { xs: 'column', sm: useFab ? 'column' : 'row' },
          gap: { xs: 2, sm: useFab ? 2 : 1 },
        }}
      >
        {/* Botão Adicionar - só visível em desktop */}
        {!useFab && (
          <Button
            variant="contained"
            startIcon={addButtonIcon}
            onClick={onAddClick}
            disabled={addButtonDisabled}
            size={isMobile ? 'small' : 'medium'}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              },
              minHeight: 48, // Touch-friendly
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              ...(addButtonLoading && {
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.6) 0%, rgba(118, 75, 162, 0.6) 100%)',
              }),
            }}
          >
            {addButtonText}
          </Button>
        )}

        {/* Container para paginação e total */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            width: useFab ? '100%' : 'auto',
            justifyContent: useFab ? 'center' : 'flex-end',
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          {/* Total de itens */}
          {totalItems !== undefined && itemName && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ 
                display: { 
                  xs: showTotalOnMobile ? 'block' : 'none', 
                  sm: 'block' 
                },
                textAlign: 'center',
                order: { xs: 2, sm: 1 },
              }}
            >
              Total: {totalItems} {itemName}
            </Typography>
          )}
          
          {/* Paginação */}
          <Box sx={{ order: { xs: 1, sm: 2 } }}>
            {paginationComponent}
          </Box>
        </Box>
      </Box>

      {/* FAB para Mobile - posicionado próximo ao rodapé da tabela */}
      {useFab && (
        <MobileAddFab
          onClick={onAddClick}
          disabled={addButtonDisabled}
          loading={addButtonLoading}
          tooltip={fabTooltip || addButtonText}
          position={{ 
            bottom: fabRelativeToTable ? 16 : 20,
            right: 16 
          }}
          containerRelative={fabRelativeToTable}
          positionType={fabRelativeToTable ? 'absolute' : 'fixed'}
        />
      )}
    </>
  );
};

export default ResponsiveTableHeader;