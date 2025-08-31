import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  FormLabel,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  Button,
} from '@mui/material';
import { useScreenReader } from '../../hooks/useAccessibility';

interface AccessibleTextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  type?: string;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  disabled?: boolean;
  helperText?: string;
  'aria-describedby'?: string;
}

export const AccessibleTextField: React.FC<AccessibleTextFieldProps> = ({
  id,
  label,
  value,
  onChange,
  error,
  required = false,
  type = 'text',
  multiline = false,
  rows,
  placeholder,
  disabled = false,
  helperText,
  'aria-describedby': ariaDescribedBy,
  ...props
}) => {
  const errorId = error ? `${id}-error` : undefined;
  const helperTextId = helperText ? `${id}-helper` : undefined;

  const describedBy =
    [ariaDescribedBy, errorId, helperTextId].filter(Boolean).join(' ') ||
    undefined;

  return (
    <TextField
      id={id}
      label={label}
      value={value}
      onChange={e => onChange(e.target.value)}
      error={!!error}
      helperText={error || helperText}
      required={required}
      type={type}
      multiline={multiline}
      rows={rows}
      placeholder={placeholder}
      disabled={disabled}
      fullWidth
      aria-describedby={describedBy}
      aria-invalid={!!error}
      aria-required={required}
      {...props}
    />
  );
};

interface AccessibleSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
}

export const AccessibleSelect: React.FC<AccessibleSelectProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  error,
  required = false,
  disabled = false,
  helperText,
}) => {
  const errorId = error ? `${id}-error` : undefined;
  const helperTextId = helperText ? `${id}-helper` : undefined;

  const describedBy =
    [errorId, helperTextId].filter(Boolean).join(' ') || undefined;

  return (
    <FormControl fullWidth error={!!error} disabled={disabled}>
      <InputLabel id={`${id}-label`} required={required}>
        {label}
      </InputLabel>
      <Select
        labelId={`${id}-label`}
        id={id}
        value={value}
        onChange={e => onChange(e.target.value as string)}
        label={label}
        aria-describedby={describedBy}
        aria-invalid={!!error}
        aria-required={required}
      >
        {options.map(option => (
          <MenuItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {(error || helperText) && (
        <FormHelperText id={describedBy}>{error || helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

interface AccessibleCheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  error?: string;
  helperText?: string;
}

export const AccessibleCheckbox: React.FC<AccessibleCheckboxProps> = ({
  id,
  label,
  checked,
  onChange,
  disabled = false,
  error,
  helperText,
}) => {
  const errorId = error ? `${id}-error` : undefined;
  const helperTextId = helperText ? `${id}-helper` : undefined;

  const describedBy =
    [errorId, helperTextId].filter(Boolean).join(' ') || undefined;

  return (
    <FormControl error={!!error} disabled={disabled}>
      <FormControlLabel
        control={
          <Checkbox
            id={id}
            checked={checked}
            onChange={e => onChange(e.target.checked)}
            aria-describedby={describedBy}
            aria-invalid={!!error}
          />
        }
        label={label}
      />
      {(error || helperText) && (
        <FormHelperText id={describedBy}>{error || helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

interface AccessibleRadioGroupProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  row?: boolean;
}

export const AccessibleRadioGroup: React.FC<AccessibleRadioGroupProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  error,
  required = false,
  disabled = false,
  helperText,
  row = false,
}) => {
  const errorId = error ? `${id}-error` : undefined;
  const helperTextId = helperText ? `${id}-helper` : undefined;

  const describedBy =
    [errorId, helperTextId].filter(Boolean).join(' ') || undefined;

  return (
    <FormControl error={!!error} disabled={disabled} required={required}>
      <FormLabel id={`${id}-label`}>{label}</FormLabel>
      <RadioGroup
        aria-labelledby={`${id}-label`}
        value={value}
        onChange={e => onChange(e.target.value)}
        row={row}
        aria-describedby={describedBy}
        aria-invalid={!!error}
        aria-required={required}
      >
        {options.map(option => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio />}
            label={option.label}
            disabled={option.disabled}
          />
        ))}
      </RadioGroup>
      {(error || helperText) && (
        <FormHelperText id={describedBy}>{error || helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

// Screen Reader Announcer Component
export const ScreenReaderAnnouncer: React.FC = () => {
  const { announcement } = useScreenReader();

  return (
    <Box
      component="div"
      aria-live="polite"
      aria-atomic="true"
      sx={{
        position: 'absolute',
        left: -10000,
        width: 1,
        height: 1,
        overflow: 'hidden',
      }}
    >
      {announcement}
    </Box>
  );
};

// Skip Link Component
export const SkipLink: React.FC<{
  href: string;
  children: React.ReactNode;
}> = ({ href, children }) => (
  <Button
    href={href}
    sx={{
      position: 'absolute',
      left: -10000,
      top: 'auto',
      width: 1,
      height: 1,
      overflow: 'hidden',
      '&:focus': {
        position: 'fixed',
        top: 0,
        left: 0,
        width: 'auto',
        height: 'auto',
        overflow: 'visible',
        zIndex: 9999,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        p: 2,
      },
    }}
  >
    {children}
  </Button>
);
