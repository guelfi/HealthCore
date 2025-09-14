import { useState, useEffect, useCallback, useRef } from 'react';
import { useResponsive } from './useResponsive';

export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  connectionType: string;
  isSlowConnection: boolean;
  deviceMemory: number;
  hardwareConcurrency: number;
}

export interface PerformanceOptimizations {
  shouldReduceAnimations: boolean;
  shouldLazyLoadImages: boolean;
  shouldUseVirtualization: boolean;
  shouldPreloadCritical: boolean;
  maxConcurrentRequests: number;
  imageQuality: number;
  chunkSize: number;
}

export interface PerformanceOptimizationResult {
  metrics: PerformanceMetrics;
  optimizations: PerformanceOptimizations;
  isLowPerformanceDevice: boolean;
  updateOptimizations: (overrides: Partial<PerformanceOptimizations>) => void;
  measurePerformance: () => void;
}

/**
 * Hook para otimização automática de performance baseada no dispositivo e conexão
 */
export const usePerformanceOptimization = (): PerformanceOptimizationResult => {
  const { isMobile, isTablet } = useResponsive();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    connectionType: 'unknown',
    isSlowConnection: false,
    deviceMemory: 4,
    hardwareConcurrency: 4
  });
  
  const [optimizations, setOptimizations] = useState<PerformanceOptimizations>({
    shouldReduceAnimations: false,
    shouldLazyLoadImages: true,
    shouldUseVirtualization: false,
    shouldPreloadCritical: true,
    maxConcurrentRequests: 6,
    imageQuality: 85,
    chunkSize: 50
  });

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const fpsRef = useRef(60);
  const animationFrameRef = useRef<number>();

  // Mede FPS em tempo real
  const measureFPS = useCallback(() => {
    const now = performance.now();
    frameCountRef.current++;
    
    if (now - lastTimeRef.current >= 1000) {
      fpsRef.current = Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current));
      frameCountRef.current = 0;
      lastTimeRef.current = now;
      
      setMetrics(prev => ({ ...prev, fps: fpsRef.current }));
    }
    
    animationFrameRef.current = requestAnimationFrame(measureFPS);
  }, []);

  // Coleta métricas do dispositivo
  const collectDeviceMetrics = useCallback(() => {
    const metrics: Partial<PerformanceMetrics> = {};

    // Memória do dispositivo
    if ('deviceMemory' in navigator) {
      metrics.deviceMemory = (navigator as any).deviceMemory || 4;
    }

    // Núcleos do processador
    if ('hardwareConcurrency' in navigator) {
      metrics.hardwareConcurrency = navigator.hardwareConcurrency || 4;
    }

    // Informações de conexão
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      metrics.connectionType = connection?.effectiveType || 'unknown';
      metrics.isSlowConnection = ['slow-2g', '2g', '3g'].includes(connection?.effectiveType);
    }

    // Uso de memória (se disponível)
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      metrics.memoryUsage = memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit;
    }

    setMetrics(prev => ({ ...prev, ...metrics }));
  }, []);

  // Calcula otimizações baseadas nas métricas
  const calculateOptimizations = useCallback(() => {
    const isLowEnd = metrics.deviceMemory <= 2 || metrics.hardwareConcurrency <= 2;
    const isSlowDevice = metrics.fps < 30 || metrics.memoryUsage > 0.8;
    const isSlowNetwork = metrics.isSlowConnection;

    const newOptimizations: PerformanceOptimizations = {
      // Reduzir animações em dispositivos lentos ou conexão lenta
      shouldReduceAnimations: isLowEnd || isSlowDevice || (isMobile && isSlowNetwork),
      
      // Lazy loading sempre ativo em mobile, crítico em dispositivos lentos
      shouldLazyLoadImages: isMobile || isLowEnd || isSlowNetwork,
      
      // Virtualização para listas grandes em dispositivos com pouca memória
      shouldUseVirtualization: isLowEnd || metrics.memoryUsage > 0.6,
      
      // Preload crítico apenas em dispositivos rápidos com boa conexão
      shouldPreloadCritical: !isLowEnd && !isSlowNetwork && metrics.fps >= 45,
      
      // Limitar requisições concorrentes em dispositivos lentos
      maxConcurrentRequests: isLowEnd ? 2 : isSlowNetwork ? 3 : isMobile ? 4 : 6,
      
      // Qualidade de imagem baseada no dispositivo e conexão
      imageQuality: isSlowNetwork ? 60 : isLowEnd ? 70 : isMobile ? 80 : 85,
      
      // Tamanho de chunk para paginação
      chunkSize: isLowEnd ? 20 : isMobile ? 30 : 50
    };

    setOptimizations(newOptimizations);
  }, [metrics, isMobile]);

  // Atualiza otimizações manualmente
  const updateOptimizations = useCallback((overrides: Partial<PerformanceOptimizations>) => {
    setOptimizations(prev => ({ ...prev, ...overrides }));
  }, []);

  // Mede performance atual
  const measurePerformance = useCallback(() => {
    collectDeviceMetrics();
    
    // Inicia medição de FPS se não estiver rodando
    if (!animationFrameRef.current) {
      measureFPS();
    }
  }, [collectDeviceMetrics, measureFPS]);

  // Determina se é um dispositivo de baixa performance
  const isLowPerformanceDevice = 
    metrics.deviceMemory <= 2 || 
    metrics.hardwareConcurrency <= 2 || 
    metrics.fps < 30 || 
    metrics.memoryUsage > 0.8;

  // Inicialização
  useEffect(() => {
    measurePerformance();
    
    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Recalcula otimizações quando métricas mudam
  useEffect(() => {
    calculateOptimizations();
  }, [calculateOptimizations]);

  // Monitora mudanças de conexão
  useEffect(() => {
    const handleConnectionChange = () => {
      collectDeviceMetrics();
    };

    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection?.addEventListener('change', handleConnectionChange);
      
      return () => {
        connection?.removeEventListener('change', handleConnectionChange);
      };
    }
  }, [collectDeviceMetrics]);

  // Monitora visibilidade da página para pausar medições
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = undefined;
        }
      } else {
        measureFPS();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [measureFPS]);

  return {
    metrics,
    optimizations,
    isLowPerformanceDevice,
    updateOptimizations,
    measurePerformance
  };
};

/**
 * Hook para debounce otimizado para performance
 */
export const usePerformanceDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  options: { leading?: boolean; trailing?: boolean; maxWait?: number } = {}
) => {
  const { optimizations } = usePerformanceOptimization();
  const { leading = false, trailing = true, maxWait } = options;
  
  // Ajusta delay baseado na performance do dispositivo
  const adjustedDelay = optimizations.shouldReduceAnimations ? delay * 1.5 : delay;
  
  const timeoutRef = useRef<NodeJS.Timeout>();
  const maxTimeoutRef = useRef<NodeJS.Timeout>();
  const lastCallTimeRef = useRef<number>();
  const lastInvokeTimeRef = useRef<number>(0);
  
  const invokeFunc = useCallback((args: Parameters<T>) => {
    lastInvokeTimeRef.current = Date.now();
    return callback(...args);
  }, [callback]);
  
  const leadingEdge = useCallback((args: Parameters<T>) => {
    lastInvokeTimeRef.current = Date.now();
    timeoutRef.current = setTimeout(() => trailingEdge(args), adjustedDelay);
    return leading ? invokeFunc(args) : undefined;
  }, [adjustedDelay, leading, invokeFunc]);
  
  const trailingEdge = useCallback((args: Parameters<T>) => {
    timeoutRef.current = undefined;
    if (trailing && lastCallTimeRef.current) {
      return invokeFunc(args);
    }
    lastCallTimeRef.current = undefined;
    return undefined;
  }, [trailing, invokeFunc]);
  
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = undefined;
    }
    lastInvokeTimeRef.current = 0;
    lastCallTimeRef.current = undefined;
  }, []);
  
  const debouncedCallback = useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    const isInvoking = !lastCallTimeRef.current;
    
    lastCallTimeRef.current = now;
    
    if (isInvoking) {
      return leadingEdge(args);
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (maxWait && (now - lastInvokeTimeRef.current) >= maxWait) {
      return invokeFunc(args);
    }
    
    timeoutRef.current = setTimeout(() => trailingEdge(args), adjustedDelay);
  }, [adjustedDelay, leadingEdge, trailingEdge, invokeFunc, maxWait]);
  
  return { debouncedCallback, cancel };
};

export default usePerformanceOptimization;