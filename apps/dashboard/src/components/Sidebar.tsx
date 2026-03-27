import UsageMeter from './UsageMeter';

export default function Sidebar({ userTier = 'FREE', usage = {} }: any) {
  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: '📊', minTier: 'FREE' },
    { label: 'Create', href: '/create', icon: '✨', minTier: 'FREE' },
    { label: 'Compose', href: '/compose', icon: '🎬', minTier: 'FREE' },
    { label: 'Content Library', href: '/content', icon: '📁', minTier: 'FREE' },
    { label: 'Schedule', href: '/schedule', icon: '📅', minTier: 'BASIC' },
    { label: 'Analytics', href: '/analytics', icon: '📈', minTier: 'PRO' },
    { label: 'Automations', href: '/automations', icon: '🤖', minTier: 'PRO' },
    { label: 'Voice Studio', href: '/voices', icon: '🎙️', minTier: 'PRO' },
    { label: 'Settings', href: '/settings', icon: '⚙️', minTier: 'FREE' }
  ];

  const tiers = ['FREE', 'STARTER', 'BASIC', 'PRO', 'BUSINESS', 'AGENCY'];
  const userTierIndex = tiers.indexOf(userTier);

  return (
    <div style={{ 
      width: '240px', 
      height: '100vh', 
      backgroundColor: '#1a1a1a', 
      color: '#fff', 
      padding: '1.5rem', 
      display: 'flex', 
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0
    }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        🚀 SocialEngine
      </div>

      <nav style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {navItems.map(item => {
          const isLocked = tiers.indexOf(item.minTier) > userTierIndex;
          return (
            <a 
              key={item.label}
              href={isLocked ? '#' : item.href}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem', 
                padding: '0.75rem', 
                borderRadius: '8px', 
                color: isLocked ? '#666' : '#ccc',
                textDecoration: 'none',
                backgroundColor: 'transparent',
                cursor: isLocked ? 'not-allowed' : 'pointer'
              }}
            >
              <span>{item.icon}</span>
              <span style={{ flexGrow: 1 }}>{item.label}</span>
              {isLocked && <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{item.minTier}</span>}
            </a>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid #333' }}>
        <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#888' }}>Usage</h4>
        <UsageMeter label="AI Captions" used={usage.captions || 0} limit={usage.captionLimit || 5} />
        <UsageMeter label="Video Gen" used={usage.videos || 0} limit={usage.videoLimit || 1} />
        
        <div style={{ 
          marginTop: '1.5rem', 
          padding: '1rem', 
          backgroundColor: '#333', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          {userTier === 'FREE' ? (
            <>
              <p style={{ fontSize: '0.8rem', margin: '0 0 0.75rem 0' }}>Upgrade for more features</p>
              <a 
                href="/pricing"
                style={{ 
                  display: 'block', 
                  padding: '0.5rem', 
                  backgroundColor: '#8e44ad', 
                  color: 'white', 
                  borderRadius: '4px', 
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 'bold'
                }}
              >
                Upgrade Now
              </a>
            </>
          ) : (
            <div style={{ fontSize: '0.85rem' }}>
              <span style={{ color: '#888' }}>Plan:</span> <strong>{userTier}</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}