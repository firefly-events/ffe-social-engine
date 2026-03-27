'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function UsagePage() {
  const { user, isLoaded } = useUser();
  
  if (!isLoaded) return <div>Loading...</div>;

  const planCache = (user?.publicMetadata?.planCache as any) || {
    tier: 'FREE',
    status: 'active',
    limits: {
      captions: 5,
      videos: 1,
      voiceClones: 0
    },
    usage: {
      captions: 0,
      videos: 0,
      voiceClones: 0
    }
  };

  const usageStats = [
    { label: 'AI Captions', used: planCache.usage?.captions || 0, limit: planCache.limits?.captions || 5, unit: 'captions' },
    { label: 'Video Generation', used: planCache.usage?.videos || 0, limit: planCache.limits?.videos || 1, unit: 'videos' },
    { label: 'Voice Clones', used: planCache.usage?.voiceClones || 0, limit: planCache.limits?.voiceClones || 0, unit: 'clones' },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Current Plan</h2>
            <p className="text-gray-500">You are currently on the <span className="font-bold text-purple-600">{planCache.tier}</span> plan.</p>
          </div>
          <Link 
            href="/pricing"
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors"
          >
            Upgrade Plan
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <div className="text-sm text-gray-500 mb-1">Status</div>
            <div className="font-bold text-green-600 capitalize">{planCache.status || 'Active'}</div>
          </div>
          <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <div className="text-sm text-gray-500 mb-1">Billing Cycle</div>
            <div className="font-bold">Monthly</div>
          </div>
          <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <div className="text-sm text-gray-500 mb-1">Next Renewal</div>
            <div className="font-bold">April 27, 2026</div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm">
        <h3 className="text-xl font-bold mb-6">Usage Statistics</h3>
        <div className="space-y-8">
          {usageStats.map((stat) => {
            const percentage = stat.limit === -1 ? 0 : Math.min((stat.used / stat.limit) * 100, 100);
            return (
              <div key={stat.label}>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="font-medium">{stat.label}</span>
                  <span className="text-gray-500">
                    <span className="font-bold text-gray-900 dark:text-gray-100">{stat.used}</span>
                    {stat.limit === -1 ? ' / ∞' : ` / ${stat.limit}`} {stat.unit}
                  </span>
                </div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-yellow-500' : 'bg-purple-600'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
