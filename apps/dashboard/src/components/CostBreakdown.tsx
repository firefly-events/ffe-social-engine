
// apps/dashboard/src/components/CostBreakdown.tsx

import React from 'react';

interface CostBreakdownProps {
  data: any[]; // Placeholder for actual cost data structure
}

export default function CostBreakdown({ data }: CostBreakdownProps) {
  return (
    <div className="bg-white shadow rounded-lg p-4 mb-4">
      <h2 className="text-xl font-semibold mb-3">Cost Breakdown</h2>
      {data && data.length > 0 ? (
        <ul>
          {data.map((item, index) => (
            <li key={index} className="flex justify-between py-1">
              <span>{item.category}:</span>
              <span className="font-medium">${item.cost.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No cost data available.</p>
      )}
    </div>
  );
}
