
import { PrometheusQueryResult } from './types';

export async function queryPrometheus(query: string): Promise<PrometheusQueryResult> {
  const response = await fetch(`/api/prometheus?query=${encodeURIComponent(query)}`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to query Prometheus');
  }

  const data = await response.json();
  return data;
}
