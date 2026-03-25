
// apps/dashboard/src/components/LogViewer.tsx

import React from 'react';

interface LogViewerProps {
  logs: string[];
}

export default function LogViewer({ logs }: LogViewerProps) {
  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg font-mono text-sm overflow-auto h-96">
      {logs.length > 0 ? (
        logs.map((log, index) => (
          <p key={index} className="whitespace-pre-wrap break-all">{log}</p>
        ))
      ) : (
        <p>No logs to display.</p>
      )}
    </div>
  );
}
