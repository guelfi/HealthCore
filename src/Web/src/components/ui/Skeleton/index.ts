// Base Skeleton
export { BaseSkeleton } from './BaseSkeleton';
export type { BaseSkeletonProps } from './BaseSkeleton';

// Card Skeleton
export { CardSkeleton } from './CardSkeleton';
export type { CardSkeletonProps } from './CardSkeleton';

// List Skeletons
export { 
  ListSkeleton,
  ContactListSkeleton,
  FileListSkeleton,
  SimpleListSkeleton
} from './ListSkeleton';
export type { ListSkeletonProps } from './ListSkeleton';

// Form Skeletons
export {
  FormSkeleton,
  LoginFormSkeleton,
  ProfileFormSkeleton
} from './FormSkeleton';
export type { FormSkeletonProps } from './FormSkeleton';

// Re-exports for compatibility
export { default as BaseSkeleton } from './BaseSkeleton';
export { default as CardSkeleton } from './CardSkeleton';
export { default as ListSkeleton } from './ListSkeleton';
export { default as FormSkeleton } from './FormSkeleton';

// Table Skeleton (re-export from Table components)
export { TableSkeleton } from '../Table';
export type { TableSkeletonProps } from '../Table';

// Common skeleton patterns
export const SkeletonPatterns = {
  // Padrões de texto
  Title: { variant: 'text' as const, height: 28, width: '60%' },
  Subtitle: { variant: 'text' as const, height: 20, width: '80%' },
  Paragraph: { variant: 'text' as const, lines: 3, height: 16 },
  Caption: { variant: 'text' as const, height: 14, width: '40%' },
  
  // Padrões de imagem
  Avatar: { variant: 'circular' as const, width: 40, height: 40 },
  AvatarLarge: { variant: 'circular' as const, width: 80, height: 80 },
  Thumbnail: { variant: 'rectangular' as const, width: 60, height: 60 },
  Banner: { variant: 'rectangular' as const, width: '100%', height: 200 },
  
  // Padrões de botão
  Button: { variant: 'rectangular' as const, width: 100, height: 36 },
  ButtonMobile: { variant: 'rectangular' as const, width: '100%', height: 44 },
  IconButton: { variant: 'circular' as const, width: 40, height: 40 },
  
  // Padrões de campo
  TextField: { variant: 'rectangular' as const, width: '100%', height: 40 },
  TextArea: { variant: 'rectangular' as const, width: '100%', height: 100 },
  Chip: { variant: 'rounded' as const, width: 80, height: 24 },
} as const;