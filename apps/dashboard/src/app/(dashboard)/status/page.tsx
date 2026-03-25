'use client';

import { useDirectorWS } from '@/lib/hooks/useDirectorWS';
import { useState } from 'react';

export default function LiveStatusPage() {
  const { isConnected, message } = useDirectorWS();
  const [controlResponse, setControlResponse] = useState<string | null>(null);
  const [loadingControl, setLoadingControl] = useState(false);

  const sendControlCommand = async (command: string, payload?: any) => {
    setLoadingControl(true);
    setControlResponse(null);
    try {
      const response = await fetch('/api/director/control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command, payload }),
      });
      const data = await response.json();
      if (response.ok) {
        setControlResponse(`Command '${command}' successful: ${JSON.stringify(data)}`);
      } else {
        setControlResponse(`Command '${command}' failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      setControlResponse(`Error sending command '${command}': ${error.message}`);
    } finally {
      setLoadingControl(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Live Status</h1>
      <p>Connection Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-3">Manual Controls</h2>
        <div className="flex gap-4">
          <button
            onClick={() => sendControlCommand('triggerCycle')}
            disabled={loadingControl}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loadingControl ? 'Processing...' : 'Trigger Cycle'}
          </button>
          <button
            onClick={() => sendControlCommand('pauseOrchestration')}
            disabled={loadingControl}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
          >
            {loadingControl ? 'Processing...' : 'Pause Orchestration'}
          </button>
          <button
            onClick={() => sendControlCommand('resumeOrchestration')}
            disabled={loadingControl}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loadingControl ? 'Processing...' : 'Resume Orchestration'}
          </button>
          {/* Add more controls as needed */}
        </div>
        {controlResponse && (
          <div className="mt-4 p-3 bg-gray-200 rounded text-sm">
            <pre>{controlResponse}</pre>
          </div>
        )}
      </div>

      {message && (
        <div className="mt-6 p-4 bg-gray-200 rounded">
          <h2 className="text-xl font-semibold">Latest WebSocket Message:</h2>
          <pre>{JSON.stringify(message, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
