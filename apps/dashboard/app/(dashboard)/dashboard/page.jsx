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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem' }}>Welcome back, {user?.firstName || 'Creator'}</h1>
          <p style={{ margin: '0.25rem 0 0 0', color: '#666' }}>Here's what's happening with your content</p>
        </div>
        <button 
          onClick={() => router.push('/create')}
          style={{ 
            padding: '0.75rem 1.5rem', 
            backgroundColor: '#8e44ad', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(142,68,173,0.3)'
          }}
        >
          + Create New
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        {metrics.map(metric => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <section>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>What would you like to create today?</h2>
            <div style={{ display: 'flex', gap: '1rem' }}>
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
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Recent Activity</h2>
            <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #ddd' }}>
              {recentContent.map(content => (
                <ContentCard key={content.title} {...content} />
              ))}
              <button style={{ 
                width: '100%', 
                padding: '0.75rem', 
                border: 'none', 
                backgroundColor: 'transparent', 
                color: '#8e44ad', 
                fontWeight: 'bold', 
                cursor: 'pointer',
                marginTop: '1rem'
              }}>
                View All Activity →
              </button>
            </div>
          </section>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <section>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Performance Chart</h2>
            <div style={{ 
              height: '300px', 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              border: '1px solid #ddd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#999',
              position: 'relative'
            }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '2rem' }}>📊</span>
                <div>Analytics Chart Stub</div>
                <div style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>Available on Pro plan</div>
              </div>
              <div style={{ 
                position: 'absolute', 
                inset: 0, 
                backgroundColor: 'rgba(255,255,255,0.7)', 
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <button 
                  onClick={() => router.push('/pricing')}
                  style={{ 
                    padding: '0.5rem 1rem', 
                    backgroundColor: '#333', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}
                >
                  UPGRADE TO SEE ANALYTICS
                </button>
              </div>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Scheduled Today</h2>
            <div style={{ 
              padding: '2rem', 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              border: '1px solid #ddd',
              textAlign: 'center',
              color: '#999'
            }}>
              <span style={{ fontSize: '1.5rem' }}>📅</span>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem' }}>No posts scheduled for today</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
