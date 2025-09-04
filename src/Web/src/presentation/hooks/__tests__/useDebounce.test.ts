import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useDebounce } from '../useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500))
    expect(result.current).toBe('initial')
  })

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 }
      }
    )

    expect(result.current).toBe('initial')

    // Change the value
    rerender({ value: 'updated', delay: 500 })
    
    // Value should not change immediately
    expect(result.current).toBe('initial')

    // Fast-forward time by 250ms (less than delay)
    act(() => {
      vi.advanceTimersByTime(250)
    })
    expect(result.current).toBe('initial')

    // Fast-forward time by another 250ms (total 500ms)
    act(() => {
      vi.advanceTimersByTime(250)
    })
    expect(result.current).toBe('updated')
  })

  it('should reset timer on rapid value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 }
      }
    )

    // Change value multiple times rapidly
    rerender({ value: 'first', delay: 500 })
    act(() => {
      vi.advanceTimersByTime(200)
    })
    
    rerender({ value: 'second', delay: 500 })
    act(() => {
      vi.advanceTimersByTime(200)
    })
    
    rerender({ value: 'final', delay: 500 })
    
    // Should still be initial value
    expect(result.current).toBe('initial')
    
    // Complete the debounce period
    act(() => {
      vi.advanceTimersByTime(500)
    })
    
    // Should have the final value
    expect(result.current).toBe('final')
  })
})