import {
  ClerkProvider,
  SignInButton,
  UserButton
} from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'

export default async function RootLayout({ children }) {
  const { userId } = await auth();
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <title>FFE Social Engine Dashboard</title>
        </head>
        <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', backgroundColor: '#f5f5f5' }}>
          <nav style={{ padding: '1rem', backgroundColor: '#333', color: 'white', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <a href="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</a>
            <a href="/create" style={{ color: 'white', textDecoration: 'none' }}>Create</a>
            <a href="/voices" style={{ color: 'white', textDecoration: 'none' }}>Voices</a>
            <a href="/templates" style={{ color: 'white', textDecoration: 'none' }}>Templates</a>
            <a href="/pricing" style={{ color: 'white', textDecoration: 'none' }}>Pricing</a>
            <div style={{ marginLeft: 'auto' }}>
              {!userId ? (
                <SignInButton mode="modal">
                  <button style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Sign In</button>
                </SignInButton>
              ) : (
                <UserButton afterSignOutUrl="/" />
              )}
            </div>
          </nav>
          <main style={{ padding: '2rem' }}>
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
