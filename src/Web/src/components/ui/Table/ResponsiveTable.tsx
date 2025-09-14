import React, { useState, useRef, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Box,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  KeyboardArrowLeft,
  KeyboardArrowRight,
  MoreVert
} from '@mui/icons-material';
import { useResponsive } from '../../../hooks/useResponsive';

export interface ResponsiveTableColumn {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
  sticky?: boolean;
  format?: (value: any) => string | React.ReactNode;
  sortable?: boolean;
  hidden?: boolean;
  mobileHidden?: boolean;
}

export interface ResponsiveTableProps {
  columns: ResponsiveTableColumn[];
  data: Record<string, any>[];
  loading?: boolean;
  onRowClick?: (row: Record<string, any>, index: number) => void;
  onSort?: (columnId: string, direction: 'asc' | 'desc') => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  maxHeight?: number | string;
  stickyHeader?: boolean;
  showScrollIndicators?: boolean;
  emptyMessage?: string;
  className?: string;
}

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  columns,
  data,
  loading = false,
  onRowClick,
  onSort,
  sortColumn,
  sortDirection,
  maxHeight = 400,
  stickyHeader = true,
  showScrollIndicators = true,
  emptyMessage = 'Nenhum dado encontrado',
  className
}) => {
  const theme = useTheme();
  const { isMobile, isTablet } = useResponsive();
  const tableRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Filtra colunas baseado na responsividade
  const visibleColumns = columns.filter(column => {
    if (column.hidden) return false;
    if (isMobile && column.mobileHidden) return false;
    return true;
  });

  // Verifica se pode fazer scroll
  const checkScrollability = () => {
    if (tableRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tableRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollability();
    const handleResize = () => checkScrollability();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [data]);

  const handleScroll = () => {
    checkScrollability();
  };

  const scrollLeft = () => {
    if (tableRef.current) {
      tableRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (tableRef.current) {
      tableRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const handleSort = (columnId: string) => {
    if (onSort) {
      const newDirection = sortColumn === columnId && sortDirection === 'asc' ? 'desc' : 'asc';
      onSort(columnId, newDirection);
    }
  };

  const renderCellContent = (column: ResponsiveTableColumn, value: any, row: Record<string, any>) => {
    if (column.format) {
      return column.format(value);
    }

    // Formatação automática para tipos comuns
    if (typeof value === 'boolean') {
      return (
        <Chip
          label={value ? 'Sim' : 'Não'}
          color={value ? 'success' : 'default'}
          size="small"
        />
      );
    }

    if (value instanceof Date) {
      return value.toLocaleDateString('pt-BR');
    }

    if (typeof value === 'number' && column.id.includes('valor')) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    }

    return value?.toString() || '-';
  };

  if (loading) {
    return (
      <Box className={`responsive-table-loading ${className || ''}`}>
        <Typography>Carregando...</Typography>
      </Box>
    );
  }

  if (data.length === 0) {
    return (
      <Box className={`responsive-table-empty ${className || ''}`}>
        <Typography color="textSecondary">{emptyMessage}</Typography>
      </Box>
    );
  }

  return (
    <Box className={`responsive-table-container ${className || ''}`}>
      {/* Indicadores de scroll */}
      {showScrollIndicators && (isMobile || isTablet) && (
        <Box className="scroll-indicators">
          <IconButton
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            size="small"
            className="scroll-button scroll-left"
          >
            <KeyboardArrowLeft />
          </IconButton>
          <IconButton
            onClick={scrollRight}
            disabled={!canScrollRight}
            size="small"
            className="scroll-button scroll-right"
          >
            <KeyboardArrowRight />
          </IconButton>
        </Box>
      )}

      <TableContainer
        component={Paper}
        ref={tableRef}
        onScroll={handleScroll}
        className="responsive-table-wrapper"
        sx={{
          maxHeight,
          overflowX: 'auto',
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            height: 8,
            width: 8,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: theme.palette.grey[100],
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.grey[400],
            borderRadius: 4,
          },
        }}
      >
        <Table stickyHeader={stickyHeader} className="responsive-table">
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
                    backgroundColor: column.sticky ? theme.palette.background.paper : 'inherit',
                    cursor: column.sortable ? 'pointer' : 'default',
                  }}
                  onClick={() => column.sortable && handleSort(column.id)}
                  className={`table-header ${column.sticky ? 'sticky-column' : ''} ${column.sortable ? 'sortable' : ''}`}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    {column.label}
                    {column.sortable && sortColumn === column.id && (
                      <Typography variant="caption" color="primary">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
              ))}
              {(isMobile || isTablet) && (
                <TableCell
                  align="center"
                  style={{
                    width: 48,
                    position: 'sticky',
                    right: 0,
                    backgroundColor: theme.palette.background.paper,
                    zIndex: 1,
                  }}
                  className="actions-column"
                >
                  Ações
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow
                key={index}
                hover={!!onRowClick}
                onClick={() => onRowClick?.(row, index)}
                className={`table-row ${onRowClick ? 'clickable' : ''}`}
                sx={{
                  cursor: onRowClick ? 'pointer' : 'default',
                  '&:hover': {
                    backgroundColor: onRowClick ? theme.palette.action.hover : 'inherit',
                  },
                }}
              >
                {visibleColumns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align || 'left'}
                    style={{
                      position: column.sticky ? 'sticky' : 'static',
                      left: column.sticky ? 0 : 'auto',
                      zIndex: column.sticky ? 1 : 'auto',
                      backgroundColor: column.sticky ? theme.palette.background.paper : 'inherit',
                    }}
                    className={`table-cell ${column.sticky ? 'sticky-column' : ''}`}
                  >
                    {renderCellContent(column, row[column.id], row)}
                  </TableCell>
                ))}
                {(isMobile || isTablet) && (
                  <TableCell
                    align="center"
                    style={{
                      position: 'sticky',
                      right: 0,
                      backgroundColor: theme.palette.background.paper,
                      zIndex: 1,
                    }}
                    className="actions-cell"
                  >
                    <IconButton size="small">
                      <MoreVert />
                    </IconButton>
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

export default ResponsiveTable;