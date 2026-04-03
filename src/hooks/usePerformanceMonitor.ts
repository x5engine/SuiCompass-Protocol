import { useEffect, useRef, useCallback } from 'react';

/**
 * Performance Monitoring Hook
 * Tracks and logs performance metrics for components
 */
export function usePerformanceMonitor(componentName: string, enabled: boolean = true) {
  const renderCount = useRef(0);
  const mountTime = useRef(Date.now());

  useEffect(() => {
    if (!enabled) return;

    renderCount.current += 1;

    // Log on first render
    if (renderCount.current === 1) {
      const loadTime = Date.now() - mountTime.current;
      console.log(`[Performance] ${componentName} mounted in ${loadTime}ms`);
    }

    // Warn if re-rendering too frequently
    if (renderCount.current > 50) {
      console.warn(
        `[Performance] ${componentName} has rendered ${renderCount.current} times. Consider optimization.`
      );
    }
  });

  return {
    renderCount: renderCount.current,
    markTime: useCallback(
      (label: string) => {
        if (!enabled) return;
        performance.mark(`${componentName}-${label}`);
      },
      [componentName, enabled]
    ),
    measureTime: useCallback(
      (startLabel: string, endLabel: string) => {
        if (!enabled) return;
        try {
          performance.measure(
            `${componentName}-${startLabel}-to-${endLabel}`,
            `${componentName}-${startLabel}`,
            `${componentName}-${endLabel}`
          );
        } catch (e) {
          console.error('Performance measurement failed:', e);
        }
      },
      [componentName, enabled]
    ),
  };
}

/**
 * Web Vitals Monitoring
 * Tracks Core Web Vitals (LCP, FID, CLS)
 */
export function useWebVitals() {
  useEffect(() => {
    // Only load web-vitals in production
    if (process.env.NODE_ENV !== 'production') return;

    import('web-vitals').then(({ onCLS, onFID, onLCP, onFCP, onTTFB }) => {
      onCLS(logVital);
      onFID(logVital);
      onLCP(logVital);
      onFCP(logVital);
      onTTFB(logVital);
    });
  }, []);
}

function logVital(metric: any) {
  console.log(`[Web Vitals] ${metric.name}:`, metric.value);

  // Send to analytics service in production
  // Example: analytics.track('web_vital', { name: metric.name, value: metric.value });
}

/**
 * Network Performance Monitor
 * Tracks API call performance
 */
export function useNetworkMonitor() {
  const trackRequest = useCallback(
    (url: string, startTime: number, endTime: number, success: boolean) => {
      const duration = endTime - startTime;
      const logLevel = duration > 3000 ? 'warn' : 'log';

      console[logLevel](`[Network] ${url} - ${duration}ms - ${success ? 'Success' : 'Failed'}`);

      // In production, send to monitoring service
      // Example: monitoring.trackAPICall({ url, duration, success });
    },
    []
  );

  return { trackRequest };
}

/**
 * Memory Usage Monitor
 * Tracks memory consumption (Chrome only)
 */
export function useMemoryMonitor(intervalMs: number = 60000) {
  useEffect(() => {
    // Only available in Chrome
    if (!('memory' in performance)) {
      console.log('[Memory] Memory monitoring not supported in this browser');
      return;
    }

    const interval = setInterval(() => {
      const memory = (performance as any).memory;
      const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
      const limitMB = Math.round(memory.jsHeapSizeLimit / 1048576);
      const percentage = ((usedMB / limitMB) * 100).toFixed(1);

      console.log(`[Memory] ${usedMB}MB / ${limitMB}MB (${percentage}%)`);

      // Warn if memory usage is high
      if (usedMB / limitMB > 0.9) {
        console.warn('[Memory] High memory usage detected. Consider optimizing.');
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);
}

/**
 * Bundle Size Reporter
 * Logs bundle size metrics on load
 */
export function reportBundleSize() {
  if (typeof window === 'undefined') return;

  window.addEventListener('load', () => {
    // Get all loaded resources
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

    const jsResources = resources.filter((r) => r.name.endsWith('.js'));
    const cssResources = resources.filter((r) => r.name.endsWith('.css'));

    const totalJsSize = jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
    const totalCssSize = cssResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);

    console.log('[Bundle] JavaScript:', (totalJsSize / 1024).toFixed(2), 'KB');
    console.log('[Bundle] CSS:', (totalCssSize / 1024).toFixed(2), 'KB');
    console.log('[Bundle] Total:', ((totalJsSize + totalCssSize) / 1024).toFixed(2), 'KB');
  });
}
