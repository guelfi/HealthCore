export const isValidDate = (date: string | Date | null | undefined): boolean => {
  if (!date) return false
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj instanceof Date && !isNaN(dateObj.getTime())
}

export const formatDate = (date: string | Date | null | undefined): string => {
  if (!isValidDate(date)) return ''
  
  const dateObj = typeof date === 'string' ? new Date(date) : date as Date
  return dateObj.toLocaleDateString('pt-BR')
}

export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!isValidDate(date)) return ''
  
  const dateObj = typeof date === 'string' ? new Date(date) : date as Date
  return dateObj.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}