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
  useTheme,
  alpha,
} from '@mui/material';
import {
  KeyboardArrowLeft,
  KeyboardArrowRight,
  TouchApp,
} from '@mui/icons-material';
import { useResponsive } from '../../../presentation/hooks/useResponsive';

export interface Column<T = unknown> {
  id: string;
  label: string;
  minWidth?: number;
  width?: number | string;
  maxWidth?: number | string;
  noWrap?: boolean;
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
  minRows?: number;
  stickyHeader?: boolean;
  touchOptimized?: boolean;
}

const MobileOptimizedTable = <T,>({
  columns,
  data,
  onRowClick,
  loading = false,
  emptyMessage = 'Nenhum item encontrado',
  rowHeight = 36,
  minRows = 10,
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

  const effectiveRowHeight = touchOptimized ? Math.max(rowHeight, isMobile ? 40 : 36) : rowHeight;
  const headerHeight = isMobile ? 40 : 42;
  const minBodyHeight = effectiveRowHeight * minRows;
  const tableHeight = minBodyHeight + headerHeight;
  const renderedRows = Math.min(Math.max(data.length || 1, 1), minRows);
  const touchHintTop = headerHeight + effectiveRowHeight * renderedRows + 10;

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>


      {/* Touch hint */}
      {isTouchDevice && scrollState.canScrollRight && (
        <Box
          sx={{
            position: 'absolute',
            top: touchHintTop,
            right: { xs: 22, sm: 28 },
            zIndex: 5,
            pointerEvents: 'none',
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.35,
              height: 34,
              px: 1,
              borderRadius: 999,
              bgcolor: '#bbf7d0',
              color: '#14532d',
              border: '2px solid rgba(22, 101, 52, 0.42)',
              boxShadow: '0 10px 24px rgba(20, 83, 45, 0.24), 0 0 0 2px rgba(255,255,255,0.82)',
              fontSize: '0.86rem',
              fontWeight: 900,
              letterSpacing: 0,
              '& .MuiSvgIcon-root': {
                flexShrink: 0,
              },
            }}
          >
            <KeyboardArrowLeft sx={{ fontSize: 18, color: '#166534' }} />
            <TouchApp sx={{ color: '#14532d', fontSize: 26 }} />
            <Box component="span">Deslize</Box>
            <KeyboardArrowRight sx={{ fontSize: 18, color: '#166534' }} />
          </Box>
        </Box>
      )}

      {/* Table */}
      <TableContainer
        component={Paper}
        ref={tableRef}
        sx={{
          maxHeight: tableHeight,
          minHeight: tableHeight,
          overflowX: 'auto',
          overflowY: 'hidden',
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth',
          // Mobile: container compacto dentro do card
          ...(isMobile && {
            maxHeight: tableHeight,
            minHeight: tableHeight,
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
          size="small"
          sx={{
            // Mobile: tabela mais compacta para caber no card
            minWidth: isMobile ? 'auto' : 600,
            width: '100%',
            tableLayout: 'fixed',
            '& .MuiTableRow-root': {
              height: effectiveRowHeight,
            },
            '& .MuiTableCell-root': {
              boxSizing: 'border-box',
            },
          }}
        >
          <TableHead>
            <TableRow>
              {visibleColumns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  sx={{
                    width: isMobile
                      ? (column.id === 'actions' ? 44 : (column.width || column.minWidth || 140))
                      : (column.width || column.minWidth || 'auto'),
                    minWidth: isMobile
                      ? (column.id === 'actions' ? 44 : (column.minWidth || 120))
                      : (column.minWidth || column.width || 'auto'),
                    maxWidth: isMobile
                      ? (column.id === 'actions' ? 44 : (column.maxWidth || column.width || column.minWidth || 180))
                      : (column.maxWidth || 'none'),
                    whiteSpace: column.noWrap === false ? 'normal' : 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontWeight: 600,
                    px: { xs: 1, sm: 1.5 },
                    py: 0.5,
                    height: headerHeight,
                    maxHeight: headerHeight,
                    lineHeight: 1.2,
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    position: column.sticky ? 'sticky' : 'static',
                    left: column.sticky ? 0 : 'auto',
                    zIndex: column.sticky ? 10 : 'auto',
                    // Mobile: padding reduzido
                    ...(isMobile && {
                      px: 1,
                      py: 0.5,
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
            {data.length === 0 ? (
              <TableRow sx={{ height: minBodyHeight }}>
                <TableCell colSpan={visibleColumns.length} align="center">
                  <Box sx={{ color: 'text.secondary', py: 4 }}>
                    {emptyMessage}
                  </Box>
                </TableCell>
              </TableRow>
            ) : data.map((row, index) => {
              const rowData = row as Record<string, unknown> & { id?: React.Key };
              return (
              <TableRow
                key={rowData.id || index}
                onClick={() => onRowClick?.(row)}
                sx={{
                  cursor: onRowClick ? 'pointer' : 'default',
                  height: effectiveRowHeight,
                  maxHeight: effectiveRowHeight,
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
                      width: isMobile
                        ? (column.id === 'actions' ? 44 : (column.width || column.minWidth || 140))
                        : (column.width || column.minWidth || 'auto'),
                      minWidth: isMobile
                        ? (column.id === 'actions' ? 44 : (column.minWidth || 120))
                        : (column.minWidth || column.width || 'auto'),
                      maxWidth: isMobile
                        ? (column.id === 'actions' ? 44 : (column.maxWidth || column.width || column.minWidth || 180))
                        : (column.maxWidth || 'none'),
                      whiteSpace: column.noWrap === false ? 'normal' : 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      px: { xs: 1, sm: 1.5 },
                      py: 0.5,
                      height: effectiveRowHeight,
                      maxHeight: effectiveRowHeight,
                      lineHeight: 1.25,
                      position: column.sticky ? 'sticky' : 'static',
                      left: column.sticky ? 0 : 'auto',
                      zIndex: column.sticky ? 5 : 'auto',
                      backgroundColor: column.sticky ? theme.palette.background.paper : 'transparent',
                      // Mobile: padding reduzido e texto menor
                      ...(isMobile && {
                        px: 1,
                        py: 0.5,
                        fontSize: '0.875rem',

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
            {data.length > 0 && data.length < minRows &&
              Array.from({ length: minRows - data.length }).map((_, index) => (
                <TableRow key={`empty-row-${index}`} sx={{ height: effectiveRowHeight, maxHeight: effectiveRowHeight }}>
                  <TableCell colSpan={visibleColumns.length} sx={{ height: effectiveRowHeight, py: 0 }} />
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MobileOptimizedTable;
