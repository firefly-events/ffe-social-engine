export default function TemplateCard({ template, onSelect }) {
  const IconMap = {
    'product-launch': '🚀',
    'behind-scenes': '🎬',
    'tutorial': '💡',
    'trending': '🔥',
    'promo': '💰',
    'event-promo': '📅',
    'scratch': '➕'
  };

  return (
    <div
      onClick={() => onSelect(template.id)}
      className={`p-8 rounded-xl bg-card cursor-pointer text-center transition-all duration-200 flex flex-col items-center justify-center gap-4 hover:-translate-y-1 hover:shadow-lg ${
        template.id === 'scratch'
          ? 'border-2 border-dashed border-border'
          : 'border border-border'
      }`}
    >
      <div className="text-5xl">
        {IconMap[template.id] || '📄'}
      </div>
      <h3 className="m-0 text-foreground">{template.name}</h3>
      <p className="m-0 text-muted-foreground text-sm">{template.description}</p>
    </div>
  );
}
