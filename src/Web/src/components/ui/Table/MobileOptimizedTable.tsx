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
  IconButton,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  KeyboardArrowLeft,
  KeyboardArrowRight,
  TouchApp,
} from '@mui/icons-material';
import { useResponsive } from '../../../presentation/hooks/useResponsive';

export interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
  sticky?: boolean;
  mobileVisible?: boolean;
  tabletVisible?: boolean;
  desktopVisible?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface MobileOptimizedTableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
  loading?: boolean;
  emptyMessage?: string;
  rowHeight?: number;
  stickyHeader?: boolean;
  showScrollIndicators?: boolean;
  touchOptimized?: boolean;
}

const MobileOptimizedTable: React.FC<MobileOptimizedTableProps> = ({
  columns,
  data,
  onRowClick,
  loading = false,
  emptyMessage = 'Nenhum item encontrado',
  rowHeight = 48,
  stickyHeader = true,
  showScrollIndicators = true,
  touchOptimized = true,
}) => {
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

  const scrollHorizontal = (direction: 'left' | 'right') => {
    if (!tableRef.current) return;
    
    const scrollAmount = 200;
    const targetScroll = direction === 'left' 
      ? tableRef.current.scrollLeft - scrollAmount
      : tableRef.current.scrollLeft + scrollAmount;
    
    tableRef.current.scrollTo({
      left: targetScroll,
      behavior: 'smooth',
    });
  };

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
      {/* Scroll indicators */}
      {showScrollIndicators && (isMobile || isTablet) && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 10,
            display: 'flex',
            gap: 0.5,
          }}
        >
          <IconButton
            size="small"
            onClick={() => scrollHorizontal('left')}
            disabled={!scrollState.canScrollLeft}
            sx={{
              bgcolor: alpha(theme.palette.background.paper, 0.9),
              backdropFilter: 'blur(4px)',
              minWidth: 36,
              minHeight: 36,
            }}
          >
            <KeyboardArrowLeft fontSize="small" />
          </IconButton>
          
          <IconButton
            size="small"
            onClick={() => scrollHorizontal('right')}
            disabled={!scrollState.canScrollRight}
            sx={{
              bgcolor: alpha(theme.palette.background.paper, 0.9),
              backdropFilter: 'blur(4px)',
              minWidth: 36,
              minHeight: 36,
            }}
          >
            <KeyboardArrowRight fontSize="small" />
          </IconButton>
        </Box>
      )}

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
            {data.map((row, index) => (
              <TableRow
                key={row.id || index}
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
                      ? column.render(row[column.id], row)
                      : row[column.id]
                    }
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MobileOptimizedTable;