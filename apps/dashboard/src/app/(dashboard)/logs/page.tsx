'use client';

import { useEffect, useState, useCallback } from 'react';
import { queryLoki } from '@/lib/loki';
import LogViewer from '@/components/LogViewer';
import { LokiQueryResult } from '@/lib/types';

export default function AgentLogsPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Draft query updated on every keystroke — does NOT trigger polling
  const [logQuery, setLogQuery] = useState('{job="director"}');
  // Active query that drives polling — only updated on submit
  const [activeLogQuery, setActiveLogQuery] = useState('{job="director"}');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result: LokiQueryResult = await queryLoki(activeLogQuery, { limit: 100 });

      if (result.status === 'success' && result.data.resultType === 'streams') {
        const fetchedLogs: string[] = result.data.result.flatMap((stream: { values: string[][] }) =>
          stream.values.map((value) => value[1])
        );
        setLogs(fetchedLogs);
      } else {
        setLogs(['No logs found or unexpected result type.']);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setLogs([`Error fetching logs: ${message}`]);
    } finally {
      setLoading(false);
    }
  }, [activeLogQuery]);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 15000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Agent Logs</h1>
      <p className="mb-4">Loki log query UI will be displayed here.</p>

      <div className="mb-4">
        <label htmlFor="logQuery" className="block text-sm font-medium text-gray-700">
          Loki Query:
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="text"
            id="logQuery"
            className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
            value={logQuery}
            onChange={(e) => setLogQuery(e.target.value)}
            placeholder='e.g., {job="director"} |= "error"'
          />
          <button
            onClick={() => setActiveLogQuery(logQuery)}
            disabled={loading}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {loading ? 'Fetching...' : 'Fetch Logs'}
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 mb-4">Error: {error}</p>}

      <LogViewer logs={logs} />
    </div>
  );
}
