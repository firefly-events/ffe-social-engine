import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';

export default function MarketingLayout({ children }) {
  return (
    <div>
      <nav style={{ padding: '1rem', backgroundColor: '#333', color: 'white', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <a href="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>🚀 SocialEngine</a>
        <a href="/pricing" style={{ color: 'white', textDecoration: 'none' }}>Pricing</a>
        <div style={{ marginLeft: 'auto' }}>
          <SignedOut>
            <SignInButton mode="modal">
              <button style={{ color: 'white', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}>Sign In</button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <a href="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Go to Dashboard</a>
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
        </div>
      </nav>
      <main style={{ padding: '2rem' }}>
        {children}
      </main>
    </div>
  );
}
