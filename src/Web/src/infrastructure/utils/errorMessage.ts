export interface ApiErrorResponse {
  status?: number;
  statusText?: string;
  data?: {
    message?: unknown;
    error?: unknown;
  };
}
export function getApiErrorResponse(error: unknown): ApiErrorResponse | undefined {
  if (!error || typeof error !== 'object' || !('response' in error)) {
    return undefined;
  }
  const response = (error as { response?: unknown }).response;
  return response && typeof response === 'object'
    ? (response as ApiErrorResponse)
    : undefined;
}
export function getErrorMessage(error: unknown, fallback: string): string {
  const response = getApiErrorResponse(error);
  const responseMessage = response?.data?.message;
  const responseError = response?.data?.error;
  if (typeof responseMessage === 'string') return responseMessage;
  if (typeof responseError === 'string') return responseError;
  if (error instanceof Error) return error.message;
  return fallback;
}