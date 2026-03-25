export default function MetricCard({ label, value, growth, icon, isLocked }: any) {
  return (
    <div style={{ 
      padding: '1.5rem', 
      backgroundColor: 'white', 
      borderRadius: '12px', 
      border: '1px solid #ddd',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    }}>
      {isLocked && (
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          backgroundColor: 'rgba(255,255,255,0.7)', 
          backdropFilter: 'blur(2px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10
        }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '1.5rem' }}>🔒</span>
            <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#666' }}>UPGRADE TO PRO</div>
          </div>
        </div>
      )}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: '#666' }}>{label}</span>
        <span style={{ fontSize: '1.2rem' }}>{icon}</span>
      </div>
      
      <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{value}</div>
      
      {growth && (
        <div style={{ 
          fontSize: '0.8rem', 
          color: growth.startsWith('+') ? '#27ae60' : '#e74c3c',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          {growth.startsWith('+') ? '↑' : '↓'} {growth} 
          <span style={{ color: '#999', marginLeft: '0.25rem' }}>this week</span>
        </div>
      )}
    </div>
  );
}