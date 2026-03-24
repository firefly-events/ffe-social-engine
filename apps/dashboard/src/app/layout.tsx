import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <nav className="p-4 bg-gray-800 text-white flex gap-4">
            <a href="/analytics" className="text-white no-underline hover:underline">Analytics</a>
            <a href="/onboard" className="text-white no-underline hover:underline">Onboard</a>
            <a href="/connect" className="text-white no-underline hover:underline">Connect</a>
            <a href="/create/chat" className="text-white no-underline hover:underline">Chat</a>
            <a href="/export" className="text-white no-underline hover:underline">Export</a>
            <a href="/preview" className="text-white no-underline hover:underline">Preview</a>
          </nav>
          <main className="p-8">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
