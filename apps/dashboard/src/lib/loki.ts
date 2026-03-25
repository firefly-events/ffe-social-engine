
import { LokiQueryResult } from './types';

// Note: Loki queries can be complex. This is a basic client.
// Real-world usage might require more sophisticated query building.
export async function queryLoki(query: string, params?: { start?: string; end?: string; limit?: number; direction?: 'forward' | 'backward' }): Promise<LokiQueryResult> {
  const urlParams = new URLSearchParams();
  urlParams.append('query', query);
  if (params?.start) urlParams.append('start', params.start);
  if (params?.end) urlParams.append('end', params.end);
  if (params?.limit) urlParams.append('limit', params.limit.toString());
  if (params?.direction) urlParams.append('direction', params.direction);

  const response = await fetch(`/api/loki?${urlParams.toString()}`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to query Loki');
  }

  const data = await response.json();
  return data;
}
