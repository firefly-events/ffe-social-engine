
// apps/dashboard/src/lib/types.ts

export interface PrometheusQueryResult {
  status: 'success' | 'error';
  data: {
    resultType: string;
    result: Array<any>;
  };
  errorType?: string;
  error?: string;
  warnings?: Array<string>;
}

export interface LokiQueryResult {
  status: 'success' | 'error';
  data: {
    resultType: 'streams' | 'scalar' | 'vector' | 'matrix';
    result: Array<any>;
  };
  errorType?: string;
  error?: string;
  warnings?: Array<string>;
}
