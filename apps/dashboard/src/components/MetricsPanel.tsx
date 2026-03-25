
// apps/dashboard/src/components/MetricsPanel.tsx

import React, { PropsWithChildren } from 'react';

interface MetricsPanelProps {
  title: string;
}

export default function MetricsPanel({ title, children }: PropsWithChildren<MetricsPanelProps>) {
  return (
    <div className="bg-white shadow rounded-lg p-4 mb-4">
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      <div>
        {children}
      </div>
    </div>
  );
}
