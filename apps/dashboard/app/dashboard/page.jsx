export default function DashboardPage() {
  const dummyContent = [
    { id: '1', type: 'event-promo', status: 'completed' },
    { id: '2', type: 'poetry', status: 'pending' },
  ];

  return (
    <div>
      <h1>Generated Content</h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {dummyContent.map((item) => (
          <li key={item.id} style={{ background: 'white', margin: '0.5rem 0', padding: '1rem', borderRadius: '8px' }}>
            <strong>{item.type}</strong> - {item.status}
            <br />
            <a href={`/content/${item.id}`} style={{ color: 'blue' }}>View Details</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
