import { useState, useCallback } from 'react';

interface UseRetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  backoffMultiplier?: number;
  maxDelay?: number;
}

interface UseRetryReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  retry: () => Promise<void>;
  retryCount: number;
  hasRetriesLeft: boolean;
}

export function useRetry<T>(
  asyncFunction: () => Promise<T>,
  options: UseRetryOptions = {}
): UseRetryReturn<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    backoffMultiplier = 2,
    maxDelay = 10000,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const calculateDelay = useCallback(
    (attempt: number): number => {
      const delay = initialDelay * Math.pow(backoffMultiplier, attempt);
      return Math.min(delay, maxDelay);
    },
    [initialDelay, backoffMultiplier, maxDelay]
  );

  const executeWithRetry = useCallback(
    async (attempt: number = 0): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const result = await asyncFunction();
        setData(result);
        setRetryCount(attempt);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));

        if (attempt < maxRetries) {
          const delay = calculateDelay(attempt);

          setTimeout(() => {
            executeWithRetry(attempt + 1);
          }, delay);

          setRetryCount(attempt + 1);
        } else {
          setError(error);
          setRetryCount(attempt);
        }
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction, maxRetries, calculateDelay]
  );

  const retry = useCallback(() => {
    return executeWithRetry(0);
  }, [executeWithRetry]);

  const hasRetriesLeft = retryCount < maxRetries;

  return {
    data,
    loading,
    error,
    retry,
    retryCount,
    hasRetriesLeft,
  };
}
