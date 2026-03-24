export default function ContentCard({ title, type, status, date, thumbnail }) {
  const statusColors = {
    'Draft': { bg: '#eee', text: '#666' },
    'Scheduled': { bg: '#fff7e6', text: '#fa8c16' },
    'Posted': { bg: '#f6ffed', text: '#52c41a' },
    'Failed': { bg: '#fff1f0', text: '#f5222d' }
  };

  const style = statusColors[status] || statusColors.Draft;

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '1rem', 
      padding: '1rem', 
      backgroundColor: 'white', 
      borderRadius: '8px', 
      border: '1px solid #eee',
      marginBottom: '0.75rem'
    }}>
      <div style={{ 
        width: '60px', 
        height: '60px', 
        borderRadius: '6px', 
        backgroundColor: '#eee',
        backgroundImage: thumbnail ? `url(${thumbnail})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        flexShrink: 0
      }} />
      
      <div style={{ flexGrow: 1 }}>
        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{title}</div>
        <div style={{ fontSize: '0.8rem', color: '#999' }}>{type} • {date}</div>
      </div>
      
      <div style={{ 
        padding: '0.2rem 0.6rem', 
        borderRadius: '4px', 
        fontSize: '0.75rem', 
        fontWeight: 'bold',
        backgroundColor: style.bg,
        color: style.text
      }}>
        {status}
      </div>
      
      <button style={{ 
        background: 'none', 
        border: 'none', 
        cursor: 'pointer', 
        fontSize: '1.2rem', 
        color: '#ccc',
        padding: '0.5rem'
      }}>
        ⋮
      </button>
    </div>
  );
}
