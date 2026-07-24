import React from 'react';
import { Box, Typography, IconButton, Button } from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  FirstPage,
  LastPage,
} from '@mui/icons-material';

interface CustomPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  size?: 'small' | 'medium' | 'large';
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  size = 'medium',
}) => {
  const safeTotalItems = Number.isFinite(totalItems) ? Math.max(0, totalItems) : 0;
  const safeItemsPerPage = Number.isFinite(itemsPerPage) && itemsPerPage > 0 ? itemsPerPage : 10;
  const derivedTotalPages = Math.ceil(safeTotalItems / safeItemsPerPage);
  const safeTotalPages = Math.max(
    1,
    Number.isFinite(totalPages) && totalPages > 0 ? totalPages : derivedTotalPages || 1
  );
  const safeCurrentPage = Math.min(
    Math.max(1, Number.isFinite(currentPage) ? currentPage : 1),
    safeTotalPages
  );

  const startItem = safeTotalItems === 0 ? 0 : (safeCurrentPage - 1) * safeItemsPerPage + 1;
  const endItem = safeTotalItems === 0 ? 0 : Math.min(safeCurrentPage * safeItemsPerPage, safeTotalItems);

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (safeTotalPages <= maxVisiblePages) {
      for (let i = 1; i <= safeTotalPages; i++) {
        pages.push(i);
      }
    } else if (safeCurrentPage <= 3) {
      for (let i = 1; i <= 3; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(safeTotalPages);
    } else if (safeCurrentPage >= safeTotalPages - 2) {
      pages.push(1);
      pages.push('...');
      for (let i = safeTotalPages - 2; i <= safeTotalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push('...');
      pages.push(safeCurrentPage);
      pages.push('...');
      pages.push(safeTotalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();
  const buttonSize = size === 'small' ? 'small' : size === 'large' ? 'large' : 'medium';
  const iconSize = size === 'small' ? 'small' : 'medium';

  const handlePageChange = (page: number) => {
    const nextPage = Math.min(Math.max(1, page), safeTotalPages);
    if (nextPage !== safeCurrentPage) {
      onPageChange(nextPage);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}
    >
      <Typography
        variant={size === 'small' ? 'caption' : 'body2'}
        color="text.secondary"
        sx={{
          mr: 2,
          display: { xs: 'none', sm: 'block' },
          minWidth: 'fit-content',
        }}
      >
        Total: {startItem}-{endItem}/{safeTotalItems}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconButton
          size={buttonSize}
          onClick={() => handlePageChange(1)}
          disabled={safeCurrentPage === 1}
          sx={{
            color: safeCurrentPage === 1 ? 'text.disabled' : 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.light',
              color: 'primary.contrastText',
            },
          }}
        >
          <FirstPage fontSize={iconSize} />
        </IconButton>

        <IconButton
          size={buttonSize}
          onClick={() => handlePageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage === 1}
          sx={{
            color: safeCurrentPage === 1 ? 'text.disabled' : 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.light',
              color: 'primary.contrastText',
            },
          }}
        >
          <ChevronLeft fontSize={iconSize} />
        </IconButton>

        {visiblePages.map((page, index) => {
          if (page === '...') {
            return (
              <Typography
                key={`ellipsis-${index}`}
                variant="body2"
                sx={{ px: 1, color: 'text.secondary', userSelect: 'none' }}
              >
                ...
              </Typography>
            );
          }

          const pageNumber = page as number;
          const isCurrentPage = pageNumber === safeCurrentPage;

          return (
            <Button
              key={pageNumber}
              size={buttonSize}
              variant={isCurrentPage ? 'contained' : 'text'}
              onClick={() => handlePageChange(pageNumber)}
              sx={{
                minWidth: size === 'small' ? 32 : 40,
                height: size === 'small' ? 32 : 40,
                borderRadius: 1,
                fontWeight: isCurrentPage ? 'bold' : 'normal',
                backgroundColor: isCurrentPage ? 'primary.main' : 'transparent',
                color: isCurrentPage ? 'primary.contrastText' : 'text.primary',
                '&:hover': {
                  backgroundColor: isCurrentPage ? 'primary.dark' : 'primary.light',
                  color: isCurrentPage ? 'primary.contrastText' : 'primary.main',
                },
              }}
            >
              {pageNumber}
            </Button>
          );
        })}

        <IconButton
          size={buttonSize}
          onClick={() => handlePageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage === safeTotalPages}
          sx={{
            color: safeCurrentPage === safeTotalPages ? 'text.disabled' : 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.light',
              color: 'primary.contrastText',
            },
          }}
        >
          <ChevronRight fontSize={iconSize} />
        </IconButton>

        <IconButton
          size={buttonSize}
          onClick={() => handlePageChange(safeTotalPages)}
          disabled={safeCurrentPage === safeTotalPages}
          sx={{
            color: safeCurrentPage === safeTotalPages ? 'text.disabled' : 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.light',
              color: 'primary.contrastText',
            },
          }}
        >
          <LastPage fontSize={iconSize} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default CustomPagination;