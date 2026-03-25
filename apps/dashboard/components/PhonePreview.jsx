export default function PhonePreview({ platform, caption, hashtags, mediaUrl }) {
  const bgColor = {
    'tiktok': '#000',
    'instagram': '#fafafa',
    'x': '#000'
  };

  const textColor = {
    'tiktok': '#fff',
    'instagram': '#262626',
    'x': '#fff'
  };

  return (
    <div style={{ 
      width: '320px', 
      height: '600px', 
      borderRadius: '36px', 
      border: '12px solid #333', 
      backgroundColor: bgColor[platform] || '#000',
      position: 'relative',
      overflow: 'hidden',
      color: textColor[platform] || '#fff',
      boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
    }}>
      {/* Media background */}
      <div style={{ 
        width: '100%', 
        height: '100%', 
        backgroundColor: '#444', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundImage: mediaUrl ? `url(${mediaUrl})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        {!mediaUrl && <span>Media Preview</span>}
      </div>

      {/* Overlay for platform specific UI */}
      <div style={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        padding: '1.5rem',
        background: 'linear-gradient(transparent, rgba(0,0,0,0.8))'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>@creator_name</div>
        <div style={{ fontSize: '0.9rem', marginBottom: '1rem', lineHeight: '1.4' }}>
          {caption}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', fontSize: '0.8rem', color: '#3498db' }}>
          {hashtags.map(tag => <span key={tag}>#{tag}</span>)}
        </div>
      </div>
      
      {/* Top Bar */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        height: '40px', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '0 1rem'
      }}>
        <div style={{ width: '60px', height: '18px', backgroundColor: '#222', borderRadius: '9px' }}></div>
      </div>
    </div>
  );
}
