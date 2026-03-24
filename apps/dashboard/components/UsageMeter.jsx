export default function UsageMeter({ label, used, limit, color = '#8e44ad' }) {
  const percentage = limit === -1 ? 0 : Math.min((used / limit) * 100, 100);
  const displayLimit = limit === -1 ? '∞' : limit;

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
        <span>{label}</span>
        <span style={{ fontWeight: 'bold' }}>{used} / {displayLimit}</span>
      </div>
      <div style={{ height: '8px', backgroundColor: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ 
          height: '100%', 
          width: `${percentage}%`, 
          backgroundColor: color, 
          transition: 'width 0.5s ease-out' 
        }} />
      </div>
    </div>
  );
}
