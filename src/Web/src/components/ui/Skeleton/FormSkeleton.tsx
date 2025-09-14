import React from 'react';
import { Box, Paper } from '@mui/material';
import { BaseSkeleton } from './BaseSkeleton';
import { useResponsive } from '../../../hooks/useResponsive';

export interface FormSkeletonProps {
  fields?: number;
  showTitle?: boolean;
  showSubtitle?: boolean;
  showActions?: boolean;
  showSections?: boolean;
  sectionsCount?: number;
  fieldsPerSection?: number;
  actionButtons?: number;
  elevation?: number;
  className?: string;
}

export const FormSkeleton: React.FC<FormSkeletonProps> = ({
  fields = 6,
  showTitle = true,
  showSubtitle = false,
  showActions = true,
  showSections = false,
  sectionsCount = 2,
  fieldsPerSection = 3,
  actionButtons = 2,
  elevation = 0,
  className
}) => {
  const { isMobile } = useResponsive();

  const renderField = (index: number, isInSection = false) => {
    const fieldTypes = ['text', 'select', 'textarea', 'checkbox', 'radio'];
    const fieldType = fieldTypes[Math.floor(Math.random() * fieldTypes.length)];
    
    return (
      <Box key={index} mb={isMobile ? 3 : 2.5}>
        {/* Label do campo */}
        <BaseSkeleton
          variant="text"
          width={`${Math.random() * 30 + 40}%`}
          height={16}
          sx={{ mb: 1 }}
        />
        
        {/* Campo baseado no tipo */}
        {fieldType === 'textarea' ? (
          <BaseSkeleton
            variant="rectangular"
            width="100%"
            height={isMobile ? 80 : 100}
            sx={{ borderRadius: 1 }}
          />
        ) : fieldType === 'checkbox' || fieldType === 'radio' ? (
          <Box display="flex" flexDirection="column" gap={1}>
            {Array.from({ length: 3 }).map((_, optionIndex) => (
              <Box key={optionIndex} display="flex" alignItems="center" gap={1}>
                <BaseSkeleton
                  variant={fieldType === 'checkbox' ? 'rectangular' : 'circular'}
                  width={20}
                  height={20}
                />
                <BaseSkeleton
                  variant="text"
                  width={`${Math.random() * 40 + 60}px`}
                  height={16}
                />
              </Box>
            ))}
          </Box>
        ) : (
          <BaseSkeleton
            variant="rectangular"
            width="100%"
            height={isMobile ? 44 : 40}
            sx={{ borderRadius: 1 }}
          />
        )}
        
        {/* Texto de ajuda ocasional */}
        {Math.random() > 0.7 && (
          <BaseSkeleton
            variant="text"
            width={`${Math.random() * 50 + 30}%`}
            height={12}
            sx={{ mt: 0.5, opacity: 0.7 }}
          />
        )}
      </Box>
    );
  };

  const renderSection = (sectionIndex: number) => (
    <Box key={sectionIndex} mb={4}>
      {/* Título da seção */}
      <BaseSkeleton
        variant="text"
        width={`${Math.random() * 40 + 30}%`}
        height={isMobile ? 20 : 24}
        sx={{ mb: 2, fontWeight: 'bold' }}
      />
      
      {/* Campos da seção */}
      {Array.from({ length: fieldsPerSection }).map((_, fieldIndex) =>
        renderField(fieldIndex, true)
      )}
    </Box>
  );

  return (
    <Paper 
      elevation={elevation}
      className={`form-skeleton ${className || ''}`}
      sx={{
        p: isMobile ? 2 : 3,
        borderRadius: 2,
        width: '100%',
      }}
    >
      {/* Título do formulário */}
      {showTitle && (
        <BaseSkeleton
          variant="text"
          width="60%"
          height={isMobile ? 24 : 28}
          sx={{ mb: 1 }}
        />
      )}
      
      {/* Subtítulo */}
      {showSubtitle && (
        <BaseSkeleton
          variant="text"
          width="80%"
          height={16}
          sx={{ mb: 3, opacity: 0.8 }}
        />
      )}

      {/* Conteúdo do formulário */}
      {showSections ? (
        // Formulário com seções
        Array.from({ length: sectionsCount }).map((_, sectionIndex) =>
          renderSection(sectionIndex)
        )
      ) : (
        // Formulário simples
        <Box>
          {Array.from({ length: fields }).map((_, fieldIndex) =>
            renderField(fieldIndex)
          )}
        </Box>
      )}

      {/* Ações do formulário */}
      {showActions && (
        <Box 
          display="flex" 
          gap={2} 
          mt={4}
          flexDirection={isMobile ? 'column' : 'row'}
          justifyContent={isMobile ? 'stretch' : 'flex-end'}
        >
          {Array.from({ length: actionButtons }).map((_, buttonIndex) => (
            <BaseSkeleton
              key={buttonIndex}
              variant="rectangular"
              width={isMobile ? '100%' : 100}
              height={isMobile ? 44 : 36}
              sx={{ borderRadius: 1 }}
            />
          ))}
        </Box>
      )}
    </Paper>
  );
};

// Skeleton para formulário de login
export const LoginFormSkeleton: React.FC<Omit<FormSkeletonProps, 'fields' | 'showSections'>> = (props) => (
  <FormSkeleton
    {...props}
    fields={3}
    showSections={false}
    actionButtons={1}
  />
);

// Skeleton para formulário de perfil
export const ProfileFormSkeleton: React.FC<Omit<FormSkeletonProps, 'showSections' | 'sectionsCount'>> = (props) => (
  <FormSkeleton
    {...props}
    showSections={true}
    sectionsCount={3}
    fieldsPerSection={4}
  />
);

export default FormSkeleton;