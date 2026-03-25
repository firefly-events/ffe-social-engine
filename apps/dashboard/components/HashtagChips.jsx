export default function HashtagChips({ hashtags, onAdd, onRemove }) {
  return (
    <div>
      <h3>Hashtags</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
        {hashtags.map((tag) => (
          <div 
            key={tag} 
            style={{ 
              backgroundColor: '#f0f0f0', 
              padding: '0.25rem 0.75rem', 
              borderRadius: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              fontSize: '0.9rem'
            }}
          >
            <span>#{tag}</span>
            <button 
              onClick={() => onRemove(tag)}
              style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, color: '#999', fontSize: '1.2rem' }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input 
          type="text" 
          placeholder="Add hashtag..." 
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onAdd(e.target.value);
              e.target.value = '';
            }
          }}
          style={{ 
            padding: '0.5rem', 
            borderRadius: '6px', 
            border: '1px solid #ccc',
            flexGrow: 1
          }}
        />
      </div>
    </div>
  );
}
