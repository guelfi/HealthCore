import { useUIStore } from '../stores/uiStore';

interface ErrorResponse {
  response?: {
    status: number;
    statusText?: string;
    data?: {
      message?: string;
      code?: string | number;
    };
  };
  request?: unknown;
  message?: string;
}

type ToastType = 'success' | 'error' | 'warning' | 'info';

const DEFAULT_DURATION = 7000; // 7s dentro do requisito de 5–8s
const DEFAULT_POSITION = { vertical: 'top' as const, horizontal: 'right' as const };

function show(
  message: string,
  type: ToastType,
  options?: {
    duration?: number;
    position?: { vertical: 'top' | 'bottom'; horizontal: 'left' | 'right' | 'center' };
    ariaLive?: 'polite' | 'assertive';
    action?: { label: string; onClick: () => void };
  }
) {
  const { addNotification } = useUIStore.getState();
  addNotification(message, type, {
    duration: options?.duration ?? DEFAULT_DURATION,
    position: options?.position ?? DEFAULT_POSITION,
    ariaLive: options?.ariaLive ?? (type === 'error' ? 'assertive' : 'polite'),
    action: options?.action,
  });
}

function mapApiError(error: unknown, entity?: 'medico' | 'paciente' | 'exame' | 'usuario') {
  const err = (error || {}) as ErrorResponse;
  const status = err.response?.status;
  const backendMessage = err.response?.data?.message || err.message || '';

  // Rede/timeout
  if (
    status === 0 ||
    /Network Error|ECONN|timeout|conex/i.test(backendMessage)
  ) {
    return 'Falha de conexão com o servidor.';
  }

  // Sem permissão
  if (status === 403 || /permiss/i.test(backendMessage)) {
    return 'Você não tem permissão para executar esta ação.';
  }

  // Não encontrado
  if (status === 404) {
    const label = entity ? `${entity}` : 'registro';
    return `O ${label} não foi encontrado.`;
  }

  // Conflito (FK / relacionamentos)
  if (status === 409 || /vinculad|associad|relacionament/i.test(backendMessage)) {
    if (entity === 'medico') {
      return 'Não é possível excluir este médico pois existem registros vinculados (pacientes ou exames)';
    }
    return 'A ação não pode ser concluída devido a registros vinculados.';
  }

  // Mensagem do backend conhecida
  if (backendMessage) {
    return backendMessage;
  }

  return 'Ocorreu um erro inesperado. Tente novamente.';
}

export const NotificationService = {
  success(message: string, options?: Parameters<typeof show>[2]) {
    show(message, 'success', options);
  },
  info(message: string, options?: Parameters<typeof show>[2]) {
    show(message, 'info', options);
  },
  warning(message: string, options?: Parameters<typeof show>[2]) {
    show(message, 'warning', options);
  },
  error(message: string, options?: Parameters<typeof show>[2]) {
    show(message, 'error', options);
  },
  // Erro específico de exclusão de médico bloqueada por FK
  medicoDeleteBlocked() {
    show(
      'Não é possível excluir este médico pois existem registros vinculados (pacientes ou exames)',
      'error',
      {
        ariaLive: 'assertive',
        duration: DEFAULT_DURATION,
        position: DEFAULT_POSITION,
      }
    );
  },
  // Tratamento genérico baseado no erro da API
  handleApiError(error: unknown, context?: { entity?: 'medico' | 'paciente' | 'exame' | 'usuario'; retry?: () => void }) {
    const message = mapApiError(error, context?.entity);
    show(message, 'error', {
      ariaLive: 'assertive',
      duration: DEFAULT_DURATION,
      position: DEFAULT_POSITION,
      action: context?.retry
        ? { label: 'Tentar novamente', onClick: context.retry }
        : undefined,
    });
  },
};

export default NotificationService;