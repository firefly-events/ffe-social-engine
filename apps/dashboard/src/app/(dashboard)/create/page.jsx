'use client';
import { useRouter } from 'next/navigation';
import TemplateCard from '@/components/TemplateCard';

export default function CreatePage() {
  const router = useRouter();

  const templates = [
    { id: 'product-launch', name: 'Product Launch', description: 'Announce a new product or feature with excitement' },
    { id: 'behind-scenes', name: 'Behind the Scenes', description: 'Show your authentic process or team' },
    { id: 'tutorial', name: 'Tutorial', description: 'Teach your audience a skill or process' },
    { id: 'trending', name: 'Trending', description: 'Ride a current trend or viral moment' },
    { id: 'promo', name: 'Promotion / Sale', description: 'Drive sales with a limited-time offer' },
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

      <div className="mt-20">
        <h2>Popular with creators like you</h2>
        <div className="flex gap-4 mt-6 overflow-x-auto pb-4">
          {['Weekly Tip', 'Q&A Response', 'Testimonial'].map(name => (
            <div key={name} className="min-w-[200px] p-6 bg-card border border-border rounded-lg text-center cursor-pointer">
              {name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
