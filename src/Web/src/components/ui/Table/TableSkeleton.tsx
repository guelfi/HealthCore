import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
  Box
} from '@mui/material';
import { ResponsiveTableColumn } from './ResponsiveTable';
import { useResponsive } from '../../../hooks/useResponsive';

export interface TableSkeletonProps {
  columns: ResponsiveTableColumn[];
  rows?: number;
  maxHeight?: number | string;
  stickyHeader?: boolean;
  className?: string;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  columns,
  rows = 5,
  maxHeight = 400,
  stickyHeader = true,
  className
}) => {
  const { isMobile, isTablet } = useResponsive();

  // Filtra colunas baseado na responsividade
  const visibleColumns = columns.filter(column => {
    if (column.hidden) return false;
    if (isMobile && column.mobileHidden) return false;
    return true;
  });

  const getSkeletonWidth = (column: ResponsiveTableColumn) => {
    if (column.minWidth) {
      return Math.min(column.minWidth, 200);
    }
    
    // Larguras baseadas no tipo de conteúdo
    if (column.id.includes('id') || column.id.includes('codigo')) return 80;
    if (column.id.includes('data') || column.id.includes('date')) return 120;
    if (column.id.includes('valor') || column.id.includes('price')) return 100;
    if (column.id.includes('status') || column.id.includes('tipo')) return 90;
    if (column.id.includes('nome') || column.id.includes('name')) return 150;
    if (column.id.includes('email')) return 180;
    if (column.id.includes('telefone') || column.id.includes('phone')) return 130;
    
    return 120; // Largura padrão
  };

  return (
    <Box className={`table-skeleton-container ${className || ''}`}>
      <TableContainer
        component={Paper}
        className="table-skeleton-wrapper"
        sx={{
          maxHeight,
          overflowX: 'auto',
          overflowY: 'auto',
        }}
      >
        <Table stickyHeader={stickyHeader} className="table-skeleton">
          <TableHead>
            <TableRow>
              {visibleColumns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{
                    minWidth: column.minWidth,
                    position: column.sticky ? 'sticky' : 'static',
                    left: column.sticky ? 0 : 'auto',
                    zIndex: column.sticky ? 1 : 'auto',
                  }}
                  className={`skeleton-header ${column.sticky ? 'sticky-column' : ''}`}
                >
                  <Skeleton
                    variant="text"
                    width={getSkeletonWidth(column) * 0.7}
                    height={24}
                    animation="wave"
                  />
                </TableCell>
              ))}
              {(isMobile || isTablet) && (
                <TableCell
                  align="center"
                  style={{
                    width: 48,
                    position: 'sticky',
                    right: 0,
                    zIndex: 1,
                  }}
                  className="skeleton-actions-column"
                >
                  <Skeleton
                    variant="text"
                    width={40}
                    height={24}
                    animation="wave"
                  />
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <TableRow key={rowIndex} className="skeleton-row">
                {visibleColumns.map((column, colIndex) => (
                  <TableCell
                    key={column.id}
                    align={column.align || 'left'}
                    style={{
                      position: column.sticky ? 'sticky' : 'static',
                      left: column.sticky ? 0 : 'auto',
                      zIndex: column.sticky ? 1 : 'auto',
                    }}
                    className={`skeleton-cell ${column.sticky ? 'sticky-column' : ''}`}
                  >
                    {/* Varia o tipo de skeleton baseado no conteúdo */}
                    {column.id.includes('status') || column.id.includes('tipo') ? (
                      <Skeleton
                        variant="rectangular"
                        width={80}
                        height={24}
                        sx={{ borderRadius: 12 }}
                        animation="wave"
                      />
                    ) : column.id.includes('avatar') || column.id.includes('foto') ? (
                      <Skeleton
                        variant="circular"
                        width={32}
                        height={32}
                        animation="wave"
                      />
                    ) : (
                      <Skeleton
                        variant="text"
                        width={getSkeletonWidth(column) * (0.6 + Math.random() * 0.4)}
                        height={20}
                        animation="wave"
                        sx={{
                          // Adiciona delay aleatório para efeito mais natural
                          animationDelay: `${(rowIndex * colIndex * 50) % 500}ms`
                        }}
                      />
                    )}
                  </TableCell>
                ))}
                {(isMobile || isTablet) && (
                  <TableCell
                    align="center"
                    style={{
                      position: 'sticky',
                      right: 0,
                      zIndex: 1,
                    }}
                    className="skeleton-actions-cell"
                  >
                    <Skeleton
                      variant="circular"
                      width={24}
                      height={24}
                      animation="wave"
                    />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TableSkeleton;