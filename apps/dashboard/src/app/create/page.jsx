'use client';
import { useRouter } from 'next/navigation';
import TemplateCard from '@/components/TemplateCard';

export default function CreatePage() {
  const router = useRouter();

  const templates = [
    { id: 'product-launch', name: 'Product Launch', description: 'Announce a new feature or product' },
    { id: 'behind-scenes', name: 'Behind the Scenes', description: 'Show the process or the team' },
    { id: 'tutorial', name: 'Tutorial / How-To', description: 'Teach something to your audience' },
    { id: 'trending', name: 'Trending Topic', description: 'Join a viral conversation' },
    { id: 'event-promo', name: 'Event Promo', description: 'Promote an upcoming event' },
    { id: 'scratch', name: 'Start from Scratch', description: 'Full control from the beginning' }
  ];

  const handleSelect = (templateId) => {
    router.push(`/create/${templateId}`);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Create New Content</h1>
      <p style={{ color: '#666', marginBottom: '3rem' }}>Pick a template to get started</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
        {templates.map(template => (
          <TemplateCard key={template.id} template={template} onSelect={handleSelect} />
        ))}
      </div>

      <div style={{ marginTop: '5rem' }}>
        <h2>Popular with creators like you</h2>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', overflowX: 'auto', paddingBottom: '1rem' }}>
          {['Weekly Tip', 'Q&A Response', 'Testimonial'].map(name => (
            <div key={name} style={{ 
              minWidth: '200px', 
              padding: '1.5rem', 
              backgroundColor: 'white', 
              border: '1px solid #ddd', 
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer'
            }}>
              {name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

