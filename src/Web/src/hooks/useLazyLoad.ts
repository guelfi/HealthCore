import { useState, useEffect, useRef, useCallback } from 'react';
import { useResponsive } from './useResponsive';

export interface LazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  delay?: number;
  disabled?: boolean;
}

export interface LazyLoadResult {
  ref: React.RefObject<HTMLElement>;
  isVisible: boolean;
  isLoaded: boolean;
  load: () => void;
  reset: () => void;
}

/**
 * Hook para lazy loading de elementos com Intersection Observer
 * Otimizado para dispositivos móveis
 */
export const useLazyLoad = (options: LazyLoadOptions = {}): LazyLoadResult => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    triggerOnce = true,
    delay = 0,
    disabled = false
  } = options;

  const { isMobile } = useResponsive();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const elementRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Ajusta configurações para mobile
  const mobileOptimizedOptions = {
    threshold: isMobile ? Math.max(threshold, 0.05) : threshold, // Threshold menor em mobile
    rootMargin: isMobile ? '100px' : rootMargin, // Margin maior em mobile para pré-carregamento
  };

  const load = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        setIsLoaded(true);
      }, delay);
    } else {
      setIsLoaded(true);
    }
  }, [delay]);

  const reset = useCallback(() => {
    setIsVisible(false);
    setIsLoaded(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (disabled) {
      setIsVisible(true);
      setIsLoaded(true);
      return;
    }

    const element = elementRef.current;
    if (!element) return;

    // Verifica se Intersection Observer está disponível
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      load();
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            load();

            if (triggerOnce && observerRef.current) {
              observerRef.current.unobserve(element);
            }
          } else if (!triggerOnce) {
            setIsVisible(false);
          }
        });
      },
      mobileOptimizedOptions
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [disabled, load, triggerOnce, mobileOptimizedOptions.threshold, mobileOptimizedOptions.rootMargin]);

  return {
    ref: elementRef,
    isVisible,
    isLoaded,
    load,
    reset
  };
};

/**
 * Hook para lazy loading de imagens com fallback e otimizações mobile
 */
export interface LazyImageOptions extends LazyLoadOptions {
  src: string;
  placeholder?: string;
  fallback?: string;
  webpSrc?: string;
  mobileSrc?: string;
  quality?: number;
}

export interface LazyImageResult extends LazyLoadResult {
  src: string;
  isError: boolean;
  retry: () => void;
}

export const useLazyImage = (options: LazyImageOptions): LazyImageResult => {
  const { src, placeholder, fallback, webpSrc, mobileSrc, quality = 75, ...lazyOptions } = options;
  const { isMobile } = useResponsive();
  const [currentSrc, setCurrentSrc] = useState(placeholder || '');
  const [isError, setIsError] = useState(false);
  const lazyLoad = useLazyLoad(lazyOptions);

  // Determina a melhor fonte baseada no dispositivo
  const getBestSrc = useCallback(() => {
    if (isMobile && mobileSrc) return mobileSrc;
    
    // Verifica suporte a WebP
    if (webpSrc && 'createImageBitmap' in window) {
      return webpSrc;
    }
    
    return src;
  }, [src, webpSrc, mobileSrc, isMobile]);

  const retry = useCallback(() => {
    setIsError(false);
    setCurrentSrc(placeholder || '');
    lazyLoad.reset();
  }, [placeholder, lazyLoad]);

  useEffect(() => {
    if (!lazyLoad.isVisible) return;

    const img = new Image();
    const targetSrc = getBestSrc();

    img.onload = () => {
      setCurrentSrc(targetSrc);
      setIsError(false);
    };

    img.onerror = () => {
      if (fallback && targetSrc !== fallback) {
        setCurrentSrc(fallback);
      } else {
        setIsError(true);
      }
    };

    img.src = targetSrc;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [lazyLoad.isVisible, getBestSrc, fallback]);

  return {
    ...lazyLoad,
    src: currentSrc,
    isError,
    retry
  };
};

/**
 * Hook para lazy loading de componentes React com code splitting
 */
export interface LazyComponentOptions extends LazyLoadOptions {
  loader: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: React.ComponentType;
}

export interface LazyComponentResult extends LazyLoadResult {
  Component: React.ComponentType<any> | null;
  isLoading: boolean;
  error: Error | null;
}

export const useLazyComponent = (options: LazyComponentOptions): LazyComponentResult => {
  const { loader, fallback, ...lazyOptions } = options;
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const lazyLoad = useLazyLoad(lazyOptions);

  useEffect(() => {
    if (!lazyLoad.isVisible || Component) return;

    setIsLoading(true);
    setError(null);

    loader()
      .then((module) => {
        setComponent(() => module.default);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err);
        setIsLoading(false);
        if (fallback) {
          setComponent(() => fallback);
        }
      });
  }, [lazyLoad.isVisible, Component, loader, fallback]);

  return {
    ...lazyLoad,
    Component,
    isLoading,
    error
  };
};

export default useLazyLoad;