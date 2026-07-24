import React from 'react';
import {
  Box,
  Button,
  Typography,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useResponsive } from '../../../presentation/hooks/useResponsive';
import MobileAddFab from '../Button/MobileAddFab';

interface ResponsiveTableHeaderProps {
  onAddClick?: () => void;
  addButtonText?: string;
  addButtonIcon?: React.ReactNode;
  addButtonDisabled?: boolean;
  addButtonLoading?: boolean;
  showAddButton?: boolean;

  paginationComponent?: React.ReactNode;

  totalItems?: number;
  itemName?: string;

  showTotalOnMobile?: boolean;
  fabTooltip?: string;

  fabRelativeToTable?: boolean;
}

const ResponsiveTableHeader: React.FC<ResponsiveTableHeaderProps> = ({
  onAddClick,
  addButtonText = 'Adicionar',
  addButtonIcon = <AddIcon />,
  addButtonDisabled = false,
  addButtonLoading = false,
  showAddButton = true,
  paginationComponent,
  totalItems,
  itemName,
  showTotalOnMobile = false,
  fabTooltip,
  fabRelativeToTable = false,
}) => {
  const { isMobile, isTablet } = useResponsive();
  const useFab = isMobile || (isTablet && !showTotalOnMobile);
  const canAdd = showAddButton && Boolean(onAddClick);

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          flexDirection: { xs: 'column', sm: useFab ? 'column' : 'row' },
          gap: { xs: 2, sm: useFab ? 2 : 1 },
        }}
      >
        {canAdd && !useFab && (
          <Button
            variant="contained"
            startIcon={addButtonIcon}
            onClick={onAddClick}
            disabled={addButtonDisabled}
            size={isMobile ? 'small' : 'medium'}
            sx={{
              background: 'linear-gradient(135deg, #6f7ee8 0%, #7f5ab6 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5f6fdb 0%, #704aa8 100%)',
              },
              minHeight: 42,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              ...(addButtonLoading && {
                background: 'linear-gradient(135deg, rgba(111, 126, 232, 0.6) 0%, rgba(127, 90, 182, 0.6) 100%)',
              }),
            }}
          >
            {addButtonText}
          </Button>
        )}

        {!canAdd && !useFab && <Box />}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            width: useFab ? '100%' : 'auto',
            justifyContent: useFab ? 'center' : 'flex-end',
            flexDirection: { xs: 'column', sm: 'row' },
            ml: !useFab ? 'auto' : 0,
          }}
        >
          {totalItems !== undefined && itemName && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: {
                  xs: showTotalOnMobile ? 'block' : 'none',
                  sm: 'block',
                },
                textAlign: 'center',
                order: { xs: 2, sm: 1 },
              }}
            >
              Total: {totalItems} {itemName}
            </Typography>
          )}

          {paginationComponent && (
            <Box sx={{ order: { xs: 1, sm: 2 } }}>
              {paginationComponent}
            </Box>
          )}
        </Box>
      </Box>

      {canAdd && useFab && (
        <MobileAddFab
          onClick={onAddClick}
          disabled={addButtonDisabled}
          loading={addButtonLoading}
          tooltip={fabTooltip || addButtonText}
          position={{
            bottom: fabRelativeToTable ? 16 : 20,
            right: 16,
          }}
          containerRelative={fabRelativeToTable}
          positionType={fabRelativeToTable ? 'absolute' : 'fixed'}
        />
      )}
    </>
  );
};

export default ResponsiveTableHeader;
