import Sidebar from '../../components/Sidebar';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';

export default function DashboardLayout({ children }) {
  // We should ideally fetch the real user tier here, but for now we'll pass stubs
  const usage = {
    captions: 3,
    captionLimit: 5,
    videos: 0,
    videoLimit: 1
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Sidebar userTier="FREE" usage={usage} />
      
      <div style={{ flexGrow: 1, marginLeft: '240px' }}>
        <header style={{ 
          height: '64px', 
          backgroundColor: 'white', 
          borderBottom: '1px solid #eee', 
          display: 'flex', 
          alignItems: 'center', 
          padding: '0 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{ flexGrow: 1, fontWeight: 'bold', fontSize: '1.2rem' }}>Dashboard</div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ 
              padding: '0.25rem 0.75rem', 
              backgroundColor: '#eee', 
              borderRadius: '20px', 
              fontSize: '0.8rem',
              fontWeight: 'bold'
            }}>
              FREE PLAN
            </span>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>
        
        <main style={{ padding: '2rem' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
