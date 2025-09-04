/**
 * Utilitários para formatação e tratamento de datas
 */

/**
 * Formata uma data para o formato brasileiro (dd/mm/aaaa)
 * Retorna string vazia se a data for inválida
 * @param date - Data a ser formatada (string, Date ou null/undefined)
 * @returns String formatada ou vazia se inválida
 */
export const formatDateBR = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Verifica se a data é válida
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    return dateObj.toLocaleDateString('pt-BR');
  } catch (error) {
    console.warn('Erro ao formatar data:', error);
    return '';
  }
};

/**
 * Verifica se uma data é válida
 * @param date - Data a ser verificada
 * @returns true se a data for válida, false caso contrário
 */
export const isValidDate = (date: string | Date | null | undefined): boolean => {
  if (!date) return false;
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return !isNaN(dateObj.getTime());
  } catch {
    return false;
  }
};