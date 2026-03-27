'use client';

import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import MetricCard from '../../../components/MetricCard';
import QuickAction from '../../../components/QuickAction';
import ContentCard from '../../../components/ContentCard';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function DashboardPage() {
  const { user } = useUser();
  const router = useRouter();

  const currentUser = useQuery(api.users.getCurrentUser, {});
  const isPro =
    currentUser?.plan === 'pro' ||
    currentUser?.plan === 'business' ||
    currentUser?.plan === 'agency';

  // These queries derive userId from server-side auth (ctx.auth.getUserIdentity)
  const dashboardMetrics = useQuery(api.posts.getDashboardMetrics, {});
  const recentPosts = useQuery(api.posts.getRecentPosts, {});

  // Scheduled today needs client timezone boundaries
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endOfDay = startOfDay + 86400000;
  const scheduledToday = useQuery(api.posts.getScheduledToday, { startOfDay, endOfDay });

  // Only fetch performance data for pro users
  const performanceData = useQuery(
    api.posts.getPerformanceData,
    isPro ? {} : 'skip'
  );

  const totalPosts =
    dashboardMetrics === undefined ? 'Loading…' : String(dashboardMetrics.total);

  const metrics = [
    { label: 'Total Posts', value: totalPosts, growth: null, icon: '📝', isLocked: false },
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
              {recentPosts === undefined ? (
                <p className="text-muted-foreground text-sm text-center py-4">Loading…</p>
              ) : recentPosts.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">No posts yet.</p>
              ) : (
                recentPosts.map(post => (
                  <ContentCard
                    key={post._id}
                    title={post.content.slice(0, 50) || 'Untitled'}
                    type={post.platforms[0] ?? 'post'}
                    status={post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                    date={new Date(post.createdAt).toLocaleDateString()}
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
              {isPro ? (
                <div className="text-center w-full px-4">
                  <span className="text-3xl">📊</span>
                  <div className="mt-2 text-sm font-medium">
                    {performanceData === undefined
                      ? 'Loading…'
                      : `${dashboardMetrics?.posted ?? 0} posts published`}
                  </div>
                  {performanceData && performanceData.byPlatform.length > 0 && (
                    <div className="mt-3 space-y-1 text-xs text-left">
                      {performanceData.byPlatform.map((p) => (
                        <div key={p.platform} className="flex justify-between">
                          <span className="capitalize">{p.platform}</span>
                          <span>{p.impressions.toLocaleString()} impressions</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
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
                </>
              )}
            </Card>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-6">Scheduled Today</h2>
            {scheduledToday === undefined ? (
              <Card className="p-8 text-center text-muted-foreground">
                <p className="text-sm">Loading…</p>
              </Card>
            ) : scheduledToday.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                <span className="text-2xl">📅</span>
                <p className="mt-2 text-sm">No posts scheduled for today</p>
              </Card>
            ) : (
              <Card className="p-4 flex flex-col gap-2">
                {scheduledToday.map((post) => (
                  <div key={post._id} className="flex flex-col gap-1 border-b last:border-0 pb-2 last:pb-0">
                    <p className="text-sm font-medium truncate">{post.content.slice(0, 60)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(post.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {' · '}
                      {post.platforms.join(', ')}
                    </p>
                  </div>
                ))}
              </Card>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
