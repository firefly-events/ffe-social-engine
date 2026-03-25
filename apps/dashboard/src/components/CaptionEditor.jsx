export default function CaptionEditor({ caption, onChange, onGenerate, isGenerating }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Caption</h3>
        <button 
          onClick={onGenerate}
          disabled={isGenerating}
          style={{ 
            padding: '0.5rem 1rem', 
            backgroundColor: '#8e44ad', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer',
            opacity: isGenerating ? 0.7 : 1
          }}
        >
          {isGenerating ? 'Generating...' : caption ? 'Regenerate' : 'Generate AI Caption'}
        </button>
      </div>
      <textarea 
        value={caption}
        onChange={(e) => onChange(e.target.value)}
        placeholder="What's your post about? Type or use AI to generate..."
        style={{ 
          width: '100%', 
          minHeight: '150px', 
          padding: '1rem', 
          borderRadius: '8px', 
          border: '1px solid #ccc',
          fontSize: '1rem',
          fontFamily: 'inherit',
          boxSizing: 'border-box'
        }}
      />
    </div>
  );
}
