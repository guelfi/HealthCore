// Lazy Loading Components
export { 
  LazyWrapper, 
  LazyRoute,
  withLazyLoading,
  preloadComponent,
  usePreloadComponent
} from './LazyWrapper';
export type { 
  LazyWrapperProps, 
  LazyRouteProps 
} from './LazyWrapper';

// Re-exports for compatibility
export { default as LazyWrapper } from './LazyWrapper';