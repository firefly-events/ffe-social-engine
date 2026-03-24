'use client';
import { useState } from 'react';

export default function CreatePage() {
  const [type, setType] = useState('poetry');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Generation started for: ' + type);
  };

  return (
    <div>
      <h1>Create Content</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
        <label>
          Content Type:
          <select value={type} onChange={(e) => setType(e.target.value)} style={{ display: 'block', width: '100%', padding: '0.5rem' }}>
            <option value="poetry">Poetry</option>
            <option value="event-promo">Event Promo</option>
          </select>
        </label>
        
        <label>
          Input Text:
          <textarea rows={4} style={{ display: 'block', width: '100%', padding: '0.5rem' }} placeholder="Enter script or prompt..."></textarea>
        </label>

        <button type="submit" style={{ padding: '0.5rem 1rem', background: 'blue', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Generate
        </button>
      </form>
    </div>
  );
}
