declare module 'web-vitals' {
  export interface Metric {
    id: string;
    name: string;
    value: number;
  }

  export type ReportHandler = (metric: Metric) => void;

  export function getCLS(onReport: ReportHandler): void;
  export function getFID(onReport: ReportHandler): void;
  export function getFCP(onReport: ReportHandler): void;
  export function getLCP(onReport: ReportHandler): void;
  export function getTTFB(onReport: ReportHandler): void;
}
