
// apps/dashboard/src/components/AgentCard.tsx

import React from 'react';

interface AgentCardProps {
  agentId: string;
  status: string;
  model: string;
  lastActive: string;
}

export default function AgentCard({ agentId, status, model, lastActive }: AgentCardProps) {
  return (
    <div className="bg-white shadow rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold">{agentId}</h3>
      <p>Status: <span className={`font-medium ${status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>{status}</span></p>
      <p>Model: {model}</p>
      <p>Last Active: {lastActive}</p>
    </div>
  );
}
