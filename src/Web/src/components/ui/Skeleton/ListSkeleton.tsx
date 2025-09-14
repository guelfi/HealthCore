import React from 'react';
import { Box, List, ListItem, ListItemAvatar, ListItemText, Divider } from '@mui/material';
import { BaseSkeleton } from './BaseSkeleton';
import { useResponsive } from '../../../hooks/useResponsive';

export interface ListSkeletonProps {
  items?: number;
  showAvatar?: boolean;
  showSecondaryText?: boolean;
  showDividers?: boolean;
  showActions?: boolean;
  avatarVariant?: 'circular' | 'rounded' | 'rectangular';
  dense?: boolean;
  className?: string;
}

export const ListSkeleton: React.FC<ListSkeletonProps> = ({
  items = 5,
  showAvatar = true,
  showSecondaryText = true,
  showDividers = true,
  showActions = false,
  avatarVariant = 'circular',
  dense = false,
  className
}) => {
  const { isMobile } = useResponsive();

  const renderListItem = (index: number) => (
    <React.Fragment key={index}>
      <ListItem
        dense={dense}
        sx={{
          py: dense ? 1 : 2,
          px: isMobile ? 2 : 3,
        }}
      >
        {/* Avatar */}
        {showAvatar && (
          <ListItemAvatar>
            <BaseSkeleton
              variant={avatarVariant}
              width={dense ? 32 : 40}
              height={dense ? 32 : 40}
            />
          </ListItemAvatar>
        )}

        {/* Texto principal e secundário */}
        <ListItemText
          primary={
            <BaseSkeleton
              variant="text"
              width={`${Math.random() * 30 + 60}%`}
              height={isMobile ? 18 : 20}
            />
          }
          secondary={
            showSecondaryText ? (
              <Box mt={0.5}>
                <BaseSkeleton
                  variant="text"
                  width={`${Math.random() * 40 + 40}%`}
                  height={isMobile ? 14 : 16}
                />
              </Box>
            ) : null
          }
        />

        {/* Ações à direita */}
        {showActions && (
          <Box display="flex" alignItems="center" gap={1}>
            <BaseSkeleton
              variant="circular"
              width={24}
              height={24}
            />
            <BaseSkeleton
              variant="circular"
              width={24}
              height={24}
            />
          </Box>
        )}
      </ListItem>

      {/* Divider */}
      {showDividers && index < items - 1 && (
        <Divider variant="inset" component="li" />
      )}
    </React.Fragment>
  );

  return (
    <List 
      className={`list-skeleton ${className || ''}`}
      sx={{
        width: '100%',
        bgcolor: 'background.paper',
        borderRadius: 1,
      }}
    >
      {Array.from({ length: items }).map((_, index) => renderListItem(index))}
    </List>
  );
};

// Skeleton para lista de contatos/usuários
export const ContactListSkeleton: React.FC<Omit<ListSkeletonProps, 'showAvatar' | 'showSecondaryText'>> = (props) => (
  <ListSkeleton
    {...props}
    showAvatar={true}
    showSecondaryText={true}
    avatarVariant="circular"
  />
);

// Skeleton para lista de arquivos/documentos
export const FileListSkeleton: React.FC<Omit<ListSkeletonProps, 'showAvatar' | 'avatarVariant'>> = (props) => (
  <ListSkeleton
    {...props}
    showAvatar={true}
    avatarVariant="rectangular"
  />
);

// Skeleton para lista simples (apenas texto)
export const SimpleListSkeleton: React.FC<Omit<ListSkeletonProps, 'showAvatar' | 'showSecondaryText'>> = (props) => (
  <ListSkeleton
    {...props}
    showAvatar={false}
    showSecondaryText={false}
  />
);

export default ListSkeleton;