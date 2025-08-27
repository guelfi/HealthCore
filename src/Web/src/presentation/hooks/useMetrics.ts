import { useState, useEffect, useCallback } from 'react';
import type { DashboardMetrics } from '../../domain/entities/Metrics';
import { metricsService } from '../../application/services/MetricsService';
import { useAuthStore } from '../../application/stores/authStore';
import { UserProfile } from '../../domain/enums/UserProfile';

interface UseMetricsOptions {
  /**
   * Se deve buscar dados automaticamente no mount
   */
  autoFetch?: boolean;
  
  /**
   * Tempo de cache em milissegundos (padrão: 5 minutos)
   */
  cacheTime?: number;
  
  /**
   * Se deve refrescar dados quando o componente ganha foco
   */
  refetchOnFocus?: boolean;
}

interface UseMetricsReturn {
  /**
   * Dados das métricas do dashboard
   */
  metrics: DashboardMetrics | null;
  
  /**
   * Estado de carregamento
   */
  isLoading: boolean;
  
  /**
   * Erro caso ocorra algum problema
   */
  error: string | null;
  
  /**
   * Se está carregando pela primeira vez
   */
  isInitialLoading: boolean;
  
  /**
   * Timestamp da última atualização dos dados
   */
  lastUpdated: Date | null;
  
  /**
   * Função para buscar métricas manualmente
   */
  fetchMetrics: () => Promise<void>;
  
  /**
   * Função para refrescar dados (com loading state)
   */
  refreshMetrics: () => Promise<void>;
  
  /**
   * Função para limpar dados e erro
   */
  reset: () => void;
  
  /**
   * Se os dados estão em cache e ainda válidos
   */
  isCached: boolean;
}

/**
 * Hook para gerenciar métricas do dashboard
 */
export const useMetrics = (options: UseMetricsOptions = {}): UseMetricsReturn => {
  const {
    autoFetch = true,
    cacheTime = 5 * 60 * 1000, // 5 minutos por padrão
    refetchOnFocus = true,
  } = options;

  // Estados
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Auth store para obter perfil do usuário
  const { user, isAuthenticated } = useAuthStore();

  /**
   * Verifica se os dados em cache ainda são válidos
   */
  const isCached = useCallback((): boolean => {
    if (!lastUpdated || !metrics) return false;
    const now = new Date();
    return (now.getTime() - lastUpdated.getTime()) < cacheTime;
  }, [lastUpdated, metrics, cacheTime]);

  /**
   * Função principal para buscar métricas
   */
  const fetchMetrics = useCallback(async (): Promise<void> => {
    // Verificar se usuário está autenticado
    if (!isAuthenticated || !user?.role) {
      setError('Usuário não autenticado');
      setIsLoading(false);
      setIsInitialLoading(false);
      return;
    }

    // Se dados em cache são válidos, não buscar novamente
    if (isCached() && metrics) {
      setIsInitialLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let metricsData: DashboardMetrics;

      // Buscar métricas baseado no perfil do usuário
      if (user.role === UserProfile.ADMINISTRADOR) {
        metricsData = await metricsService.getAdminMetrics();
      } else if (user.role === UserProfile.MEDICO) {
        metricsData = await metricsService.getMedicoMetrics();
      } else {
        throw new Error('Perfil de usuário não suportado para métricas');
      }

      setMetrics(metricsData);
      setLastUpdated(new Date());
      setError(null);
    } catch (err: any) {
      console.error('Erro ao carregar métricas:', err);
      setError(err.message || 'Erro ao carregar métricas do dashboard');
      
      // Em caso de erro, manter dados anteriores se existirem
      if (!metrics) {
        setMetrics(null);
      }
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  }, [isAuthenticated, user?.role, isCached, metrics]);

  /**
   * Função para refrescar dados (force reload)
   */
  const refreshMetrics = useCallback(async (): Promise<void> => {
    setLastUpdated(null); // Forçar reload ignorando cache
    await fetchMetrics();
  }, [fetchMetrics]);

  /**
   * Função para resetar estado
   */
  const reset = useCallback((): void => {
    setMetrics(null);
    setError(null);
    setIsLoading(false);
    setIsInitialLoading(true);
    setLastUpdated(null);
  }, []);

  /**
   * Effect para buscar dados no mount (se autoFetch = true)
   */
  useEffect(() => {
    if (autoFetch && isAuthenticated && user?.role) {
      fetchMetrics();
    }
  }, [autoFetch, isAuthenticated, user?.role, fetchMetrics]);

  /**
   * Effect para refrescar dados quando usuário muda
   */
  useEffect(() => {
    if (isAuthenticated && user?.role) {
      // Reset quando usuário muda
      if (metrics && lastUpdated) {
        reset();
        fetchMetrics();
      }
    } else {
      // Limpar dados quando usuário desloga
      reset();
    }
  }, [user?.id, user?.role]); // Dependências específicas para detectar mudança de usuário

  /**
   * Effect para refetch on window focus (se habilitado)
   */
  useEffect(() => {
    if (!refetchOnFocus) return;

    const handleFocus = () => {
      // Só refrescar se dados estão stale (fora do cache time)
      if (!isCached() && isAuthenticated && user?.role) {
        fetchMetrics();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnFocus, isCached, isAuthenticated, user?.role, fetchMetrics]);

  /**
   * Effect para cleanup quando componente desmonta
   */
  useEffect(() => {
    return () => {
      // Cleanup se necessário
    };
  }, []);

  return {
    metrics,
    isLoading,
    error,
    isInitialLoading,
    lastUpdated,
    fetchMetrics,
    refreshMetrics,
    reset,
    isCached: isCached(),
  };
};

export default useMetrics;