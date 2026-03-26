'use client';

import { useUser } from '@clerk/nextjs';
import MetricCard from '../../../components/MetricCard';
import QuickAction from '../../../components/QuickAction';
import ContentCard from '../../../components/ContentCard';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user } = useUser();
  const router = useRouter();

  const metrics = [
    { label: 'Total Posts', value: '12', growth: '+2', icon: '📝', isLocked: false },
    { label: 'Avg Engagement', value: '4.2%', growth: '+0.5%', icon: '🔥', isLocked: true },
    { label: 'Top Platform', value: 'TikTok', growth: null, icon: '📱', isLocked: true },
    { label: 'New Followers', value: '124', growth: '+15%', icon: '👥', isLocked: true }
  ];

  const quickActions = [
    { title: 'TikTok Video', icon: '📽️', color: '#ff0050', templateId: 'product-launch' },
    { title: 'Instagram Reel', icon: '📸', color: '#c13584', templateId: 'behind-scenes' },
    { title: 'YouTube Short', icon: '🎥', color: '#ff0000', templateId: 'tutorial' },
    { title: 'Social Post', icon: '💬', color: '#1da1f2', templateId: 'trending' }
  ];

  const recentContent = [
    { title: 'New Product Demo', type: 'Video', status: 'Posted', date: '2 hours ago' },
    { title: 'Team Meeting', type: 'Image', status: 'Scheduled', date: 'Tomorrow, 10:00 AM' },
    { title: 'Tutorial Part 1', type: 'Video', status: 'Draft', date: '1 day ago' }
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 m-0">Welcome back, {user?.firstName || 'Creator'}</h1>
          <p className="text-slate-400 mt-1 m-0">Here&apos;s what&apos;s happening with your content</p>
        </div>
        <button
          onClick={() => router.push('/create')}
          className="px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(139,92,246,0.3)] border-none cursor-pointer"
        >
          + Create New
        </button>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {metrics.map(metric => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid gap-8" style={{ gridTemplateColumns: '1fr 400px' }}>
        <div className="flex flex-col gap-8">
          <section>
            <h2 className="text-xl font-semibold text-slate-100 mb-6">What would you like to create today?</h2>
            <div className="flex gap-4">
              {quickActions.map(action => (
                <QuickAction
                  key={action.title}
                  {...action}
                  onClick={() => router.push(`/create/${action.templateId}`)}
                />
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-100 mb-6">Recent Activity</h2>
            <div className="p-4 bg-slate-900/50 rounded-xl border border-white/[0.07]">
              {recentContent.map(content => (
                <ContentCard key={content.title} {...content} />
              ))}
              <button className="w-full py-3 border-none bg-transparent text-purple-400 hover:text-purple-300 font-semibold cursor-pointer mt-4 transition-colors">
                View All Activity →
              </button>
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-8">
          <section>
            <h2 className="text-xl font-semibold text-slate-100 mb-6">Performance Chart</h2>
            <div className="h-72 bg-slate-900/50 rounded-xl border border-white/[0.07] flex items-center justify-center text-slate-500 relative">
              <div className="text-center">
                <span className="text-4xl">📊</span>
                <div className="mt-2 text-sm">Analytics Chart Stub</div>
                <div className="text-xs mt-1 text-slate-600">Available on Pro plan</div>
              </div>
              <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center rounded-xl">
                <button
                  onClick={() => router.push('/pricing')}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:opacity-90 transition-opacity border-none cursor-pointer shadow-[0_0_16px_rgba(139,92,246,0.4)]"
                >
                  UPGRADE TO SEE ANALYTICS
                </button>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-100 mb-6">Scheduled Today</h2>
            <div className="p-8 bg-slate-900/50 rounded-xl border border-white/[0.07] text-center text-slate-500">
              <span className="text-2xl">📅</span>
              <p className="text-sm mt-2 m-0">No posts scheduled for today</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
