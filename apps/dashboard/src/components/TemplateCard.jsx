export default function TemplateCard({ template, onSelect }) {
  const IconMap = {
    'product-launch': '🚀',
    'behind-scenes': '🎬',
    'tutorial': '💡',
    'trending': '🔥',
    'event-promo': '📅',
    'scratch': '➕'
  };

  return (
    <div 
      onClick={() => onSelect(template.id)}
      style={{ 
        border: template.id === 'scratch' ? '2px dashed #ccc' : '1px solid #ddd', 
        padding: '2rem', 
        borderRadius: '12px', 
        backgroundColor: 'white',
        cursor: 'pointer',
        textAlign: 'center',
        transition: 'transform 0.2s, box-shadow 0.2s',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ fontSize: '3rem' }}>
        {IconMap[template.id] || '📄'}
      </div>
      <h3 style={{ margin: 0 }}>{template.name}</h3>
      <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{template.description}</p>
    </div>
  );
}
