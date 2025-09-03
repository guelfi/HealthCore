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
  // Calcular o range de itens da página atual
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Gerar array de páginas para mostrar
  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5; // Reduzido para mostrar menos páginas

    if (totalPages <= maxVisiblePages) {
      // Se temos poucas páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para páginas com ellipsis
      if (currentPage <= 3) {
        // Início: 1 2 3 ... último
        for (let i = 1; i <= 3; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Final: 1 ... penúltimo último
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Meio: 1 ... atual ... último
        pages.push(1);
        pages.push('...');
        pages.push(currentPage);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  const buttonSize =
    size === 'small' ? 'small' : size === 'large' ? 'large' : 'medium';
  const iconSize = size === 'small' ? 'small' : 'medium';

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
      {/* Informação de total */}
      <Typography
        variant={size === 'small' ? 'caption' : 'body2'}
        color="text.secondary"
        sx={{
          mr: 2,
          display: { xs: 'none', sm: 'block' },
          minWidth: 'fit-content',
        }}
      >
        Total: {startItem}-{endItem}/{totalItems}
      </Typography>

      {/* Navegação */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {/* Primeira página */}
        <IconButton
          size={buttonSize}
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          sx={{
            color: currentPage === 1 ? 'text.disabled' : 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.light',
              color: 'primary.contrastText',
            },
          }}
        >
          <FirstPage fontSize={iconSize} />
        </IconButton>

        {/* Página anterior */}
        <IconButton
          size={buttonSize}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          sx={{
            color: currentPage === 1 ? 'text.disabled' : 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.light',
              color: 'primary.contrastText',
            },
          }}
        >
          <ChevronLeft fontSize={iconSize} />
        </IconButton>

        {/* Números das páginas */}
        {visiblePages.map((page, index) => {
          if (page === '...') {
            return (
              <Typography
                key={`ellipsis-${index}`}
                variant="body2"
                sx={{
                  px: 1,
                  color: 'text.secondary',
                  userSelect: 'none',
                }}
              >
                ...
              </Typography>
            );
          }

          const pageNumber = page as number;
          const isCurrentPage = pageNumber === currentPage;

          return (
            <Button
              key={pageNumber}
              size={buttonSize}
              variant={isCurrentPage ? 'contained' : 'text'}
              onClick={() => onPageChange(pageNumber)}
              sx={{
                minWidth: size === 'small' ? 32 : 40,
                height: size === 'small' ? 32 : 40,
                borderRadius: 1,
                fontWeight: isCurrentPage ? 'bold' : 'normal',
                backgroundColor: isCurrentPage ? 'primary.main' : 'transparent',
                color: isCurrentPage ? 'primary.contrastText' : 'text.primary',
                '&:hover': {
                  backgroundColor: isCurrentPage
                    ? 'primary.dark'
                    : 'primary.light',
                  color: isCurrentPage
                    ? 'primary.contrastText'
                    : 'primary.main',
                },
              }}
            >
              {pageNumber}
            </Button>
          );
        })}

        {/* Próxima página */}
        <IconButton
          size={buttonSize}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          sx={{
            color:
              currentPage === totalPages ? 'text.disabled' : 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.light',
              color: 'primary.contrastText',
            },
          }}
        >
          <ChevronRight fontSize={iconSize} />
        </IconButton>

        {/* Última página */}
        <IconButton
          size={buttonSize}
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          sx={{
            color:
              currentPage === totalPages ? 'text.disabled' : 'primary.main',
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
