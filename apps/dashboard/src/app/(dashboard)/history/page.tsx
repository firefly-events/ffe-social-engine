'use client';

import TimelineChart from '@/components/TimelineChart';

export default function CycleHistoryPage() {
  // Dummy data for the timeline chart
  const dummyTimelineData = [
    { id: 1, event: 'Cycle Started', timestamp: '2026-03-20T10:00:00Z' },
    { id: 2, event: 'Agent Spawned (FIR-1179)', timestamp: '2026-03-20T10:05:00Z' },
    { id: 3, event: 'Task Completed (FIR-1179)', timestamp: '2026-03-20T10:30:00Z' },
    { id: 4, event: 'Cycle Completed', timestamp: '2026-03-20T11:00:00Z' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Cycle History</h1>
      <p className="mb-4">Cycle execution history will be displayed here.</p>
      
      <TimelineChart data={dummyTimelineData} />
    </div>
  );
}
