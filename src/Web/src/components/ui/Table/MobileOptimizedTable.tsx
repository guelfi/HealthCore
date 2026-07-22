import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  TouchApp,
} from '@mui/icons-material';
import { useResponsive } from '../../../presentation/hooks/useResponsive';

export interface Column<T = unknown> {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
  sticky?: boolean;
  mobileVisible?: boolean;
  tabletVisible?: boolean;
  desktopVisible?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
}

interface MobileOptimizedTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  rowHeight?: number;
  stickyHeader?: boolean;
  touchOptimized?: boolean;
}

const MobileOptimizedTable = <T,>({
  columns,
  data,
  onRowClick,
  loading = false,
  emptyMessage = 'Nenhum item encontrado',
  rowHeight = 48,
  stickyHeader = true,
  touchOptimized = true,
}: MobileOptimizedTableProps<T>) => {
  const theme = useTheme();
  const { isMobile, isTablet, isTouchDevice } = useResponsive();
  const tableRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: false,
  });

  const getVisibleColumns = useCallback(() => {
    if (isMobile) {
      // Em mobile: máximo 2 colunas + ações
      const actionsColumn = columns.find(col => col.id === 'actions');
      const dataColumns = columns.filter(col =>
        col.id !== 'actions' && col.mobileVisible !== false
      ).slice(0, 2); // Máximo 2 colunas de dados

      return actionsColumn ? [actionsColumn, ...dataColumns] : dataColumns;
    }

    return columns.filter(column => {
      if (isTablet) return column.tabletVisible !== false;
      return column.desktopVisible !== false;
    });
  }, [columns, isMobile, isTablet]);

  const visibleColumns = getVisibleColumns();

  const checkScrollState = useCallback(() => {
    if (!tableRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = tableRef.current;
    setScrollState({
      canScrollLeft: scrollLeft > 0,
      canScrollRight: scrollLeft < scrollWidth - clientWidth - 1,
    });
  }, []);


  useEffect(() => {
    const tableElement = tableRef.current;
    if (!tableElement) return;

    checkScrollState();
    tableElement.addEventListener('scroll', checkScrollState);
    window.addEventListener('resize', checkScrollState);

    return () => {
      tableElement.removeEventListener('scroll', checkScrollState);
      window.removeEventListener('resize', checkScrollState);
    };
  }, [checkScrollState]);

  useEffect(() => {
    const timer = setTimeout(checkScrollState, 100);
    return () => clearTimeout(timer);
  }, [data, checkScrollState]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <div>Carregando...</div>
      </Box>
    );
  }

  if (data.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
        {emptyMessage}
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>


      {/* Touch hint */}
      {isTouchDevice && scrollState.canScrollRight && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            right: 16,
            transform: 'translateY(-50%)',
            zIndex: 5,
            pointerEvents: 'none',
          }}
        >
          <Chip
            icon={<TouchApp />}
            label="Deslize"
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.8),
              color: 'white',
              fontSize: '0.75rem',
            }}
          />
        </Box>
      )}

      {/* Table */}
      <TableContainer
        component={Paper}
        ref={tableRef}
        sx={{
          maxHeight: 450,
          overflowX: 'auto',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth',
          // Mobile: container compacto dentro do card
          ...(isMobile && {
            maxHeight: 'none',
            boxShadow: 'none',
            border: 'none',
            borderRadius: 0,
            bgcolor: 'transparent',
          }),
          '&::-webkit-scrollbar': {
            height: 6,
            width: 6,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: alpha(theme.palette.grey[300], 0.3),
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: alpha(theme.palette.grey[500], 0.5),
            borderRadius: 3,
          },
        }}
      >
        <Table
          stickyHeader={stickyHeader}
          sx={{
            // Mobile: tabela mais compacta para caber no card
            minWidth: isMobile ? 'auto' : 600,
            width: '100%',
          }}
        >
          <TableHead>
            <TableRow>
              {visibleColumns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  sx={{
                    // Mobile: colunas mais compactas
                    minWidth: isMobile
                      ? (column.id === 'actions' ? 50 : 100)
                      : (column.minWidth || 'auto'),
                    maxWidth: isMobile
                      ? (column.id === 'actions' ? 50 : 150)
                      : 'none',
                    fontWeight: 600,
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    position: column.sticky ? 'sticky' : 'static',
                    left: column.sticky ? 0 : 'auto',
                    zIndex: column.sticky ? 10 : 'auto',
                    // Mobile: padding reduzido
                    ...(isMobile && {
                      px: 1,
                      py: 1,
                      fontSize: '0.875rem',
                    }),
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {data.map((row, index) => {
              const rowData = row as Record<string, unknown> & { id?: React.Key };
              return (
              <TableRow
                key={rowData.id || index}
                onClick={() => onRowClick?.(row)}
                sx={{
                  cursor: onRowClick ? 'pointer' : 'default',
                  height: touchOptimized ? Math.max(rowHeight, 48) : rowHeight,
                  '&:hover': onRowClick ? {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  } : {},
                  ...(isTouchDevice && onRowClick && {
                    '&:active': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.12),
                      transform: 'scale(0.99)',
                      transition: 'all 0.1s ease',
                    },
                  }),
                }}
              >
                {visibleColumns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align || 'left'}
                    sx={{
                      // Mobile: células mais compactas
                      minWidth: isMobile
                        ? (column.id === 'actions' ? 50 : 100)
                        : (column.minWidth || 'auto'),
                      maxWidth: isMobile
                        ? (column.id === 'actions' ? 50 : 150)
                        : 'none',
                      position: column.sticky ? 'sticky' : 'static',
                      left: column.sticky ? 0 : 'auto',
                      zIndex: column.sticky ? 5 : 'auto',
                      backgroundColor: column.sticky ? theme.palette.background.paper : 'transparent',
                      // Mobile: padding reduzido e texto menor
                      ...(isMobile && {
                        px: 1,
                        py: 1,
                        fontSize: '0.875rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }),
                    }}
                  >
                    {column.render
                      ? column.render(rowData[column.id], row)
                      : String(rowData[column.id] ?? '')
                    }
                  </TableCell>
                ))}
              </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MobileOptimizedTable;