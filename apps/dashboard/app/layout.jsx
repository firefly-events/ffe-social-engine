import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <title>FFE Social Engine Dashboard</title>
        </head>
        <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', backgroundColor: '#f5f5f5' }}>
          <main>
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
