import { Metric } from 'web-vitals';

export type MeasuredMetric = (Metric & { rating?: string }) | {
  name: 'INP';
  value: number;
  delta: number;
  id: string;
  entries: PerformanceEntry[];
  rating: 'good' | 'needs-improvement' | 'poor';
};

const reportWebVitals = (onPerfEntry?: (metric: MeasuredMetric) => void) => {
  if (!onPerfEntry || !(onPerfEntry instanceof Function)) return;
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(onPerfEntry);
    getFID(onPerfEntry);
    getFCP(onPerfEntry);
    getLCP(onPerfEntry);
    getTTFB(onPerfEntry);
  });

  // web-vitals v2 predates INP. Capture the longest Event Timing interaction
  // so deployments still measure the Core Web Vital that replaced FID.
  if ('PerformanceObserver' in window) {
    try {
      let longest = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const duration = entry.duration;
          if (duration <= longest) continue;
          longest = duration;
          onPerfEntry({ name: 'INP', value: duration, delta: duration, id: `inp-${Math.round(duration)}`, entries: [entry], rating: duration <= 200 ? 'good' : duration <= 500 ? 'needs-improvement' : 'poor' });
        }
      });
      observer.observe({ type: 'event', buffered: true, durationThreshold: 40 } as PerformanceObserverInit);
    } catch {
      // Event Timing is progressive enhancement.
    }
  }
};

export default reportWebVitals;
