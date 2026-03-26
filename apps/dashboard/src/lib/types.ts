// apps/dashboard/src/lib/types.ts

export interface PrometheusInstantSample {
  metric: Record<string, string>;
  value: [number, string]; // [timestamp, value]
}

interface PrometheusSuccessResult {
  status: 'success';
  data: {
    resultType: 'vector' | 'matrix' | 'scalar' | 'string';
    result: PrometheusInstantSample[];
  };
  warnings?: string[];
}

interface PrometheusErrorResult {
  status: 'error';
  errorType: string;
  error: string;
}

export type PrometheusQueryResult = PrometheusSuccessResult | PrometheusErrorResult;

export interface LokiStream {
  stream: Record<string, string>;
  values: [string, string][]; // [nanosecond timestamp, log line]
}

interface LokiSuccessResult {
  status: 'success';
  data: {
    resultType: 'streams' | 'scalar' | 'vector' | 'matrix';
    result: LokiStream[];
  };
  warnings?: string[];
}

interface LokiErrorResult {
  status: 'error';
  errorType: string;
  error: string;
}

export type LokiQueryResult = LokiSuccessResult | LokiErrorResult;
