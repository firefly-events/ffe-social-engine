'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import MetricCard from '../../../components/MetricCard';
import QuickAction from '../../../components/QuickAction';
import ContentCard from '../../../components/ContentCard';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface RecentContentItem {
  id: string;
  title?: string;
  text?: string;
  type?: string;
  status: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { user } = useUser();
  const router = useRouter();
  const [recentContent, setRecentContent] = useState<RecentContentItem[]>([]);

  useEffect(() => {
    fetch('/api/content?limit=3')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.items)) {
          setRecentContent(data.items);
        }
      })
      .catch(err => console.error('Failed to fetch recent content:', err));
  }, []);

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

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.firstName || 'Creator'}</h1>
          <p className="mt-1 text-muted-foreground">Here&apos;s what&apos;s happening with your content</p>
        </div>
        <Button
          onClick={() => router.push('/create')}
          className="bg-purple-600 hover:bg-purple-700 text-white shadow-[0_4px_12px_rgba(142,68,173,0.3)]"
        >
          + Create New
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {metrics.map(metric => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid grid-cols-[1fr_400px] gap-8">
        <div className="flex flex-col gap-8">
          <section>
            <h2 className="text-xl font-semibold mb-6">What would you like to create today?</h2>
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
            <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
            <Card className="p-4">
              {recentContent.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">No recent content yet.</p>
              ) : (
                recentContent.map(content => (
                  <ContentCard
                    key={content.id}
                    title={content.title || content.text?.slice(0, 50) || 'Untitled'}
                    type={content.type || 'text'}
                    status={content.status.charAt(0).toUpperCase() + content.status.slice(1)}
                    date={new Date(content.createdAt).toLocaleDateString()}
                  />
                ))
              )}
              <Button
                variant="ghost"
                className="w-full mt-4 text-purple-600 hover:text-purple-700 font-bold"
                onClick={() => router.push('/content')}
              >
                View All Activity →
              </Button>
            </Card>
          </section>
        </div>

        <div className="flex flex-col gap-8">
          <section>
            <h2 className="text-xl font-semibold mb-6">Performance Chart</h2>
            <Card className="h-[300px] flex items-center justify-center text-muted-foreground relative">
              <div className="text-center">
                <span className="text-3xl">📊</span>
                <div>Analytics Chart Stub</div>
                <div className="text-xs mt-2">Available on Pro plan</div>
              </div>
              <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center rounded-xl">
                <Button
                  size="sm"
                  onClick={() => router.push('/pricing')}
                  className="bg-foreground text-background hover:bg-foreground/90 text-xs font-bold uppercase"
                >
                  Upgrade to see analytics
                </Button>
              </div>
            </Card>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-6">Scheduled Today</h2>
            <Card className="p-8 text-center text-muted-foreground">
              <span className="text-2xl">📅</span>
              <p className="mt-2 text-sm">No posts scheduled for today</p>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
