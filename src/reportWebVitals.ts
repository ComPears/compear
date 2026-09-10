import type { Metric } from 'web-vitals';

export type MeasuredMetric = Metric;

const reportWebVitals = (onPerfEntry?: (metric: MeasuredMetric) => void) => {
  if (!onPerfEntry || !(onPerfEntry instanceof Function)) return;
  import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
    onCLS(onPerfEntry);
    onINP(onPerfEntry);
    onFCP(onPerfEntry);
    onLCP(onPerfEntry);
    onTTFB(onPerfEntry);
  });
};

export default reportWebVitals;
