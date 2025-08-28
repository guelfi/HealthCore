import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  useTheme,
} from '@mui/material';
import { useResponsive } from '../../hooks/useResponsive';

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  format?: (value: any, row?: any) => React.ReactNode;
  hideOnMobile?: boolean;
}

interface ResponsiveTableProps {
  columns: Column[];
  data: any[];
  keyField: string;
  onRowClick?: (row: any) => void;
  loading?: boolean;
  emptyMessage?: string;
  mobileCardRenderer?: (row: any, index: number) => React.ReactNode;
}

const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  columns,
  data,
  keyField,
  onRowClick,
  loading = false,
  emptyMessage = 'Nenhum dado encontrado',
  mobileCardRenderer,
}) => {
  const { isMobile } = useResponsive();
  const theme = useTheme();

  // Filter columns for mobile view
  const visibleColumns = isMobile 
    ? columns.filter(col => !col.hideOnMobile)
    : columns;

  // Default mobile card renderer
  const defaultMobileCardRenderer = (row: any, index: number) => (
    <Card 
      key={row[keyField]} 
      sx={{ 
        mb: 2, 
        cursor: onRowClick ? 'pointer' : 'default',
        '&:hover': onRowClick ? { bgcolor: 'action.hover' } : {},
      }}
      onClick={() => onRowClick?.(row)}
    >
      <CardContent>
        {columns.map((column) => {
          const value = row[column.id];
          const formattedValue = column.format ? column.format(value, row) : value;
          
          return (
            <Box key={column.id} mb={1}>
              <Typography variant="caption" color="text.secondary">
                {column.label}
              </Typography>
              <Typography variant="body2">
                {formattedValue}
              </Typography>
            </Box>
          );
        })}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box p={2}>
        <Typography>Carregando...</Typography>
      </Box>
    );
  }

  if (data.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body1" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  // Mobile view
  if (isMobile) {
    return (
      <Box>
        {data.map((row, index) => 
          mobileCardRenderer 
            ? mobileCardRenderer(row, index)
            : defaultMobileCardRenderer(row, index)
        )}
      </Box>
    );
  }

  // Desktop view
  return (
    <TableContainer 
      component={Paper} 
      sx={{ 
        maxHeight: 600,
        '& .MuiTableCell-root': {
          borderBottom: `1px solid ${theme.palette.divider}`,
        }
      }}
    >
      <Table stickyHeader aria-label="responsive table">
        <TableHead>
          <TableRow>
            {visibleColumns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align}
                style={{ minWidth: column.minWidth }}
                sx={{ 
                  fontWeight: 'bold',
                  bgcolor: 'background.paper',
                }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow
              key={row[keyField]}
              hover={!!onRowClick}
              onClick={() => onRowClick?.(row)}
              sx={{ 
                cursor: onRowClick ? 'pointer' : 'default',
                '&:last-child td, &:last-child th': { border: 0 },
              }}
            >
              {visibleColumns.map((column) => {
                const value = row[column.id];
                const formattedValue = column.format ? column.format(value, row) : value;
                
                return (
                  <TableCell key={column.id} align={column.align}>
                    {formattedValue}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ResponsiveTable;