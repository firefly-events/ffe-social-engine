// Shared in-memory job store for video generation
// This module is a singleton within the Node.js process

interface VideoJob {
  status: 'processing' | 'ready' | 'error';
  userId: string;
  videoUrl?: string;
  error?: string;
  createdAt: number;
}

declare global {
  // Use global to survive HMR in dev
  var __videoJobStore: Map<string, VideoJob> | undefined;
}

const jobStore: Map<string, VideoJob> = globalThis.__videoJobStore ?? new Map();
if (!globalThis.__videoJobStore) {
  globalThis.__videoJobStore = jobStore;
  // Clean up old jobs every 10 minutes
  setInterval(() => {
    const cutoff = Date.now() - 2 * 60 * 60 * 1000;
    for (const [id, job] of jobStore.entries()) {
      if (job.createdAt < cutoff) jobStore.delete(id);
    }
  }, 10 * 60 * 1000);
}

export function setVideoJob(jobId: string, job: VideoJob) {
  jobStore.set(jobId, job);
}

export function getVideoJob(jobId: string): VideoJob | undefined {
  return jobStore.get(jobId);
}

export { jobStore };
