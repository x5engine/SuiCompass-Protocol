import React, { Suspense, ComponentType, LazyExoticComponent } from 'react';
import LoadingState from './LoadingState';

interface LazyLoadProps {
  component: LazyExoticComponent<ComponentType<any>>;
  fallback?: React.ReactNode;
  [key: string]: any;
}

/**
 * Lazy Load Wrapper
 * Wraps lazy-loaded components with Suspense and loading fallback
 */
export default function LazyLoad({ component: Component, fallback, ...props }: LazyLoadProps) {
  const defaultFallback = (
    <LoadingState message="Loading page..." size="large" fullScreen />
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      <Component {...props} />
    </Suspense>
  );
}

/**
 * Helper function to create lazy-loaded components with consistent fallback
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = React.lazy(importFn);

  return (props: React.ComponentProps<T>) => (
    <LazyLoad component={LazyComponent as any} fallback={fallback} {...props} />
  );
}

/**
 * Preload a lazy component
 * Useful for prefetching components before they're needed
 */
export function preloadComponent(importFn: () => Promise<any>) {
  const component = React.lazy(importFn);
  // Trigger the import
  importFn();
  return component;
}
