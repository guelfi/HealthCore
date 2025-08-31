/**
 * Utilitários de formatação para campos brasileiros
 */

/**
 * Formata CPF no padrão brasileiro (000.000.000-00)
 */
export const formatCPF = (cpf: string): string => {
  if (!cpf) return '';

  // Remove caracteres não numéricos
  const numbers = cpf.replace(/\D/g, '');

  // Aplica a máscara do CPF
  if (numbers.length <= 11) {
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  return cpf; // Retorna original se inválido
};

/**
 * Remove formatação do CPF, deixando apenas números
 */
export const unformatCPF = (cpf: string): string => {
  return cpf.replace(/\D/g, '');
};

/**
 * Formata telefone no padrão brasileiro
 * (11) 99999-9999 para celular
 * (11) 9999-9999 para fixo
 */
export const formatPhone = (phone: string): string => {
  if (!phone) return '';

  // Remove caracteres não numéricos
  const numbers = phone.replace(/\D/g, '');

  // Celular com 11 dígitos: (11) 99999-9999
  if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }

  // Fixo com 10 dígitos: (11) 9999-9999
  if (numbers.length === 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }

  // Formatação parcial durante digitação
  if (numbers.length > 6) {
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
  } else if (numbers.length > 2) {
    return numbers.replace(/(\d{2})(\d{0,5})/, '($1) $2');
  } else if (numbers.length > 0) {
    return numbers.replace(/(\d{0,2})/, '($1');
  }

  return numbers;
};

/**
 * Remove formatação do telefone, deixando apenas números
 */
export const unformatPhone = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

/**
 * Formata data no padrão brasileiro (dd/mm/aaaa)
 */
export const formatDateBR = (date: string | Date): string => {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Verifica se a data é válida
    if (isNaN(dateObj.getTime())) {
      return '';
    }

    return dateObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch (error) {
    return '';
  }
};

/**
 * Formata data e hora no padrão brasileiro (dd/mm/aaaa às hh:mm)
 */
export const formatDateTimeBR = (date: string | Date): string => {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Verifica se a data é válida
    if (isNaN(dateObj.getTime())) {
      return '';
    }

    return dateObj.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return '';
  }
};

/**
 * Converte data do formato brasileiro (dd/mm/aaaa) para ISO (aaaa-mm-dd)
 */
export const parseDateBR = (dateBR: string): string => {
  if (!dateBR) return '';

  // Remove caracteres não numéricos e barras
  const clean = dateBR.replace(/[^\d\/]/g, '');

  // Verifica formato dd/mm/aaaa
  const match = clean.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (match) {
    const [, day, month, year] = match;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    // Verifica se a data é válida
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0]; // Retorna formato YYYY-MM-DD
    }
  }

  return '';
};

/**
 * Valida CPF brasileiro
 */
export const isValidCPF = (cpf: string): boolean => {
  const numbers = unformatCPF(cpf);

  if (numbers.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(numbers)) return false;

  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers[i]) * (10 - i);
  }
  let digit1 = (sum * 10) % 11;
  if (digit1 === 10) digit1 = 0;

  if (digit1 !== parseInt(numbers[9])) return false;

  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers[i]) * (11 - i);
  }
  let digit2 = (sum * 10) % 11;
  if (digit2 === 10) digit2 = 0;

  return digit2 === parseInt(numbers[10]);
};

/**
 * Valida telefone brasileiro
 */
export const isValidPhone = (phone: string): boolean => {
  const numbers = unformatPhone(phone);

  // Celular: 11 dígitos (DDD + 9 + 8 dígitos)
  // Fixo: 10 dígitos (DDD + 8 dígitos)
  return numbers.length === 10 || numbers.length === 11;
};

/**
 * Máscara dinâmica para CPF durante digitação
 */
export const applyCPFMask = (value: string): string => {
  const numbers = value.replace(/\D/g, '');

  if (numbers.length <= 3) {
    return numbers;
  } else if (numbers.length <= 6) {
    return numbers.replace(/(\d{3})(\d{0,3})/, '$1.$2');
  } else if (numbers.length <= 9) {
    return numbers.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
  } else {
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
  }
};

/**
 * Máscara dinâmica para telefone durante digitação
 */
export const applyPhoneMask = (value: string): string => {
  const numbers = value.replace(/\D/g, '');

  if (numbers.length === 0) {
    return '';
  } else if (numbers.length <= 2) {
    return `(${numbers}`;
  } else if (numbers.length <= 6) {
    return numbers.replace(/(\d{2})(\d{0,4})/, '($1) $2');
  } else if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  } else {
    return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  }
};
