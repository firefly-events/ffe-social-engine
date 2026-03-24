export default function PricingPage() {
  const tiers = [
    { name: 'Free', price: '$0', description: 'Export-only (copy caption + download video, no direct posting)' },
    { name: 'Starter', price: '$9.99', description: 'Basic features, limited credits' },
    { name: 'Pro', price: '$14.99', description: 'Advanced tools, higher limits' },
    { name: 'Influencer', price: '$29.99', description: 'Priority generation, more platforms' },
    { name: 'Agency', price: '$100', description: 'Multi-account management, bulk tools' },
    { name: 'Enterprise', price: '$299', description: 'Custom integrations, unlimited scaling' }
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Pricing Tiers</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
        {tiers.map((tier) => (
          <div key={tier.name} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', backgroundColor: 'white' }}>
            <h2>{tier.name}</h2>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{tier.price}/mo</p>
            <p>{tier.description}</p>
            <button style={{ width: '100%', padding: '0.5rem', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Select {tier.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
