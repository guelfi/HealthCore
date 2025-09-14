import React from 'react';
import { Box, Card, CardContent, CardActions } from '@mui/material';
import { BaseSkeleton } from './BaseSkeleton';
import { useResponsive } from '../../../hooks/useResponsive';

export interface CardSkeletonProps {
  showAvatar?: boolean;
  showImage?: boolean;
  showActions?: boolean;
  titleLines?: number;
  contentLines?: number;
  imageHeight?: number | string;
  avatarSize?: number;
  actionsCount?: number;
  elevation?: number;
  className?: string;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  showAvatar = false,
  showImage = false,
  showActions = false,
  titleLines = 1,
  contentLines = 3,
  imageHeight = 200,
  avatarSize = 40,
  actionsCount = 2,
  elevation = 1,
  className
}) => {
  const { isMobile } = useResponsive();

  return (
    <Card 
      elevation={elevation} 
      className={`card-skeleton ${className || ''}`}
      sx={{
        width: '100%',
        borderRadius: 2,
      }}
    >
      {/* Imagem do card */}
      {showImage && (
        <BaseSkeleton
          variant="rectangular"
          width="100%"
          height={isMobile ? 160 : imageHeight}
          sx={{ borderRadius: '8px 8px 0 0' }}
        />
      )}

      <CardContent sx={{ pb: showActions ? 1 : 2 }}>
        {/* Header com avatar */}
        {showAvatar && (
          <Box display="flex" alignItems="center" mb={2}>
            <BaseSkeleton
              variant="circular"
              width={avatarSize}
              height={avatarSize}
              sx={{ mr: 2 }}
            />
            <Box flex={1}>
              <BaseSkeleton
                variant="text"
                width="60%"
                height={20}
                sx={{ mb: 0.5 }}
              />
              <BaseSkeleton
                variant="text"
                width="40%"
                height={16}
              />
            </Box>
          </Box>
        )}

        {/* Título */}
        <BaseSkeleton
          variant="text"
          lines={titleLines}
          width="85%"
          height={isMobile ? 20 : 24}
          sx={{ mb: 1 }}
        />

        {/* Conteúdo */}
        <BaseSkeleton
          variant="text"
          lines={contentLines}
          height={isMobile ? 16 : 18}
          spacing={6}
        />

        {/* Tags ou chips */}
        <Box display="flex" gap={1} mt={2}>
          {Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map((_, index) => (
            <BaseSkeleton
              key={index}
              variant="rounded"
              width={Math.random() * 40 + 60}
              height={24}
            />
          ))}
        </Box>
      </CardContent>

      {/* Ações do card */}
      {showActions && (
        <CardActions sx={{ pt: 0, pb: 2, px: 2 }}>
          <Box display="flex" gap={1} width="100%">
            {Array.from({ length: actionsCount }).map((_, index) => (
              <BaseSkeleton
                key={index}
                variant="rounded"
                width={isMobile ? '100%' : 80}
                height={isMobile ? 44 : 36}
                sx={{
                  flex: isMobile ? 1 : 'none',
                }}
              />
            ))}
          </Box>
        </CardActions>
      )}
    </Card>
  );
};

export default CardSkeleton;