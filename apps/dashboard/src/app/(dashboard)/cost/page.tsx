'use client';

import { useEffect, useState } from 'react';
import { queryPrometheus } from '@/lib/prometheus';
import MetricsPanel from '@/components/MetricsPanel';
import CostBreakdown from '@/components/CostBreakdown'; // Import the new component
import { PrometheusQueryResult } from '@/lib/types';

export default function CostTrackingPage() {
  const [cpuUsage, setCpuUsage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dummy data for cost breakdown
  const dummyCostData = [
    { category: 'Haiku Agents', cost: 150.75 },
    { category: 'Sonnet Agents', cost: 300.50 },
    { category: 'Opus Agents', cost: 750.00 },
    { category: 'Qdrant Usage', cost: 80.20 },
    { category: 'Loki Storage', cost: 25.10 },
  ];

  useEffect(() => {
    const fetchCpuUsage = async () => {
      setLoading(true);
      setError(null);
      try {
        const result: PrometheusQueryResult = await queryPrometheus('sum(rate(node_cpu_seconds_total{mode!="idle"}[5m]))');
        
        if (result.status === 'success' && result.data.result.length > 0) {
          const value = result.data.result[0].value[1];
          setCpuUsage(parseFloat(value).toFixed(2) + '%');
        } else {
          setCpuUsage('N/A');
        }
      } catch (err: any) {
        setError(err.message);
        setCpuUsage('Error');
      } finally {
        setLoading(false);
      }
    };

    fetchCpuUsage();
    const interval = setInterval(fetchCpuUsage, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Cost Tracking</h1>
      <p className="mb-4">Cost tracking by agent/repo will be displayed here.</p>

      <MetricsPanel title="Overall System Metrics">
        {loading && <p>Loading CPU Usage...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {cpuUsage && (
          <p>CPU Usage: <span className="font-semibold text-blue-600">{cpuUsage}</span></p>
        )}
      </MetricsPanel>

      <CostBreakdown data={dummyCostData} /> {/* Integrate CostBreakdown */}
    </div>
  );
}
