import { describe, it, expect } from 'vitest'
import { formatDate, formatDateTime, isValidDate } from '../dateUtils'

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('should format valid date string', () => {
      const result = formatDate('2024-01-15T10:30:00Z')
      expect(result).toBe('15/01/2024')
    })

    it('should format valid Date object', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      const result = formatDate(date)
      expect(result).toBe('15/01/2024')
    })

    it('should return empty string for invalid date', () => {
      const result = formatDate('invalid-date')
      expect(result).toBe('')
    })

    it('should return empty string for null', () => {
      const result = formatDate(null)
      expect(result).toBe('')
    })

    it('should return empty string for undefined', () => {
      const result = formatDate(undefined)
      expect(result).toBe('')
    })
  })

  describe('formatDateTime', () => {
    it('should format valid date string with time', () => {
      const result = formatDateTime('2024-01-15T10:30:00Z')
      expect(result).toMatch(/15\/01\/2024, \d{2}:\d{2}/)
    })

    it('should format valid Date object with time', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      const result = formatDateTime(date)
      expect(result).toMatch(/15\/01\/2024, \d{2}:\d{2}/)
    })

    it('should return empty string for invalid date', () => {
      const result = formatDateTime('invalid-date')
      expect(result).toBe('')
    })
  })

  describe('isValidDate', () => {
    it('should return true for valid date string', () => {
      const result = isValidDate('2024-01-15T10:30:00Z')
      expect(result).toBe(true)
    })

    it('should return true for valid Date object', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      const result = isValidDate(date)
      expect(result).toBe(true)
    })

    it('should return false for invalid date string', () => {
      const result = isValidDate('invalid-date')
      expect(result).toBe(false)
    })

    it('should return false for null', () => {
      const result = isValidDate(null)
      expect(result).toBe(false)
    })

    it('should return false for undefined', () => {
      const result = isValidDate(undefined)
      expect(result).toBe(false)
    })
  })
})