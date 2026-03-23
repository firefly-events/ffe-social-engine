export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>FFE Social Engine Dashboard</title>
      </head>
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', backgroundColor: '#f5f5f5' }}>
        <nav style={{ padding: '1rem', backgroundColor: '#333', color: 'white', display: 'flex', gap: '1rem' }}>
          <a href="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</a>
          <a href="/create" style={{ color: 'white', textDecoration: 'none' }}>Create</a>
          <a href="/voices" style={{ color: 'white', textDecoration: 'none' }}>Voices</a>
          <a href="/templates" style={{ color: 'white', textDecoration: 'none' }}>Templates</a>
        </nav>
        <main style={{ padding: '2rem' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
