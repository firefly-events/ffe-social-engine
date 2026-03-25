export default function TierBadge({ tier }: any) {
  const colors = {
    'FREE': { bg: '#eee', text: '#666' },
    'STARTER': { bg: '#d5f5e3', text: '#27ae60' },
    'BASIC': { bg: '#d6eaf8', text: '#2980b9' },
    'PRO': { bg: '#ebdef0', text: '#8e44ad' },
    'BUSINESS': { bg: '#fef5e7', text: '#e67e22' },
    'AGENCY': { bg: '#fdedec', text: '#e74c3c' }
  };

  const style = colors[tier] || colors.FREE;

  return (
    <span style={{ 
      backgroundColor: style.bg, 
      color: style.text, 
      padding: '0.2rem 0.5rem', 
      borderRadius: '4px', 
      fontSize: '0.7rem', 
      fontWeight: 'bold',
      textTransform: 'uppercase',
      marginLeft: '0.5rem'
    }}>
      {tier}
    </span>
  );
}