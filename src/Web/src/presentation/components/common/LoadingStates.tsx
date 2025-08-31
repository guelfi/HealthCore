import React from 'react';
import {
  Box,
  Skeleton,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  LinearProgress,
  Typography,
} from '@mui/material';

// Loading Spinner Component
export const LoadingSpinner: React.FC<{ size?: number; message?: string }> = ({
  size = 40,
  message,
}) => (
  <Box display="flex" flexDirection="column" alignItems="center" gap={2} py={4}>
    <CircularProgress size={size} />
    {message && (
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    )}
  </Box>
);

// Page Loading Component
export const PageLoading: React.FC<{ message?: string }> = ({
  message = 'Carregando...',
}) => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    minHeight="400px"
    gap={2}
  >
    <CircularProgress size={60} />
    <Typography variant="h6" color="text.secondary">
      {message}
    </Typography>
  </Box>
);

// Progress Bar Component
export const ProgressBar: React.FC<{
  value?: number;
  message?: string;
  variant?: 'determinate' | 'indeterminate';
}> = ({ value, message, variant = 'indeterminate' }) => (
  <Box sx={{ width: '100%', py: 2 }}>
    {message && (
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {message}
      </Typography>
    )}
    <LinearProgress
      variant={variant}
      value={value}
      sx={{ height: 8, borderRadius: 4 }}
    />
    {variant === 'determinate' && value !== undefined && (
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 1, display: 'block' }}
      >
        {Math.round(value)}%
      </Typography>
    )}
  </Box>
);

// Table Skeleton Component
export const TableSkeleton: React.FC<{
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}> = ({ rows = 5, columns = 4, showHeader = true }) => (
  <TableContainer>
    <Table>
      {showHeader && (
        <TableHead>
          <TableRow>
            {Array.from({ length: columns }).map((_, index) => (
              <TableCell key={index}>
                <Skeleton variant="text" width="80%" />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
      )}
      <TableBody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <TableRow key={rowIndex}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <TableCell key={colIndex}>
                <Skeleton
                  variant="text"
                  width={colIndex === 0 ? '60%' : '40%'}
                />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

// Card Skeleton Component
export const CardSkeleton: React.FC<{
  height?: number;
  showAvatar?: boolean;
}> = ({ height = 200, showAvatar = false }) => (
  <Card>
    <CardContent>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        {showAvatar && <Skeleton variant="circular" width={40} height={40} />}
        <Box flex={1}>
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </Box>
      </Box>
      <Skeleton variant="rectangular" width="100%" height={height - 100} />
    </CardContent>
  </Card>
);

// List Skeleton Component
export const ListSkeleton: React.FC<{
  items?: number;
  showAvatar?: boolean;
}> = ({ items = 5, showAvatar = true }) => (
  <Box>
    {Array.from({ length: items }).map((_, index) => (
      <Box key={index} display="flex" alignItems="center" gap={2} py={2}>
        {showAvatar && <Skeleton variant="circular" width={40} height={40} />}
        <Box flex={1}>
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="text" width="50%" />
        </Box>
        <Skeleton variant="rectangular" width={80} height={32} />
      </Box>
    ))}
  </Box>
);

// Form Skeleton Component
export const FormSkeleton: React.FC<{
  fields?: number;
}> = ({ fields = 4 }) => (
  <Box>
    {Array.from({ length: fields }).map((_, index) => (
      <Box key={index} mb={3}>
        <Skeleton variant="text" width="30%" height={20} />
        <Skeleton
          variant="rectangular"
          width="100%"
          height={56}
          sx={{ mt: 1 }}
        />
      </Box>
    ))}
    <Box display="flex" gap={2} justifyContent="flex-end" mt={4}>
      <Skeleton variant="rectangular" width={100} height={36} />
      <Skeleton variant="rectangular" width={100} height={36} />
    </Box>
  </Box>
);

// Dashboard Skeleton Component
export const DashboardSkeleton: React.FC = () => (
  <Box>
    <Skeleton variant="text" width="40%" height={40} sx={{ mb: 3 }} />

    {/* Metric Cards */}
    <Box
      display="grid"
      gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))"
      gap={3}
      mb={4}
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <CardSkeleton key={index} height={120} showAvatar />
      ))}
    </Box>

    {/* Charts/Tables */}
    <Box
      display="grid"
      gridTemplateColumns="repeat(auto-fit, minmax(400px, 1fr))"
      gap={3}
    >
      <CardSkeleton height={300} />
      <CardSkeleton height={300} />
    </Box>
  </Box>
);
