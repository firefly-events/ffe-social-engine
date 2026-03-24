export default function QuickAction({ title, icon, color = '#333', onClick }) {
  return (
    <div 
      onClick={onClick}
      style={{ 
        flex: 1,
        padding: '1.25rem', 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        border: '1px solid #ddd',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        transition: 'transform 0.1s, border-color 0.1s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = color;
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#ddd';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{ 
        width: '40px', 
        height: '40px', 
        borderRadius: '8px', 
        backgroundColor: `${color}15`, 
        color: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.25rem'
      }}>
        {icon}
      </div>
      <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{title}</div>
    </div>
  );
}
