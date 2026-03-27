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
    <div className="max-w-[1200px] mx-auto p-8">
      <h1 className="mb-2">Create New Content</h1>
      <p className="text-muted-foreground mb-12">Pick a template to get started</p>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8">
        {templates.map(template => (
          <TemplateCard key={template.id} template={template} onSelect={handleSelect} />
        ))}
      </div>

    </div>
  );
}
