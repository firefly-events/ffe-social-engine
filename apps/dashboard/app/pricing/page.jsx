'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [interval, setInterval] = useState('monthly');

  const tiers = [
    { 
      id: 'free',
      name: 'Free', 
      price: { monthly: '$0', annual: '$0' }, 
      description: 'Export-only (5 captions/mo, 1 video/mo)',
      features: ['5 AI Captions/mo', '1 Video/mo', 'No direct posting']
    },
    { 
      id: 'starter',
      name: 'Starter', 
      price: { monthly: '$9.99', annual: '$95.90' }, 
      description: 'Basic features, unlimited exports',
      features: ['50 AI Captions/mo', '5 Videos/mo', 'Unlimited exports']
    },
    { 
      id: 'basic',
      name: 'Basic', 
      price: { monthly: '$14.99', annual: '$143.90' }, 
      description: 'Direct posting, scheduling',
      features: ['100 AI Captions/mo', '10 Videos/mo', '30 Posts/mo', 'Direct posting']
    },
    { 
      id: 'pro',
      name: 'Pro', 
      price: { monthly: '$29.99', annual: '$287.90' }, 
      description: 'Automations, analytics',
      features: ['500 AI Captions/mo', '25 Videos/mo', '100 Posts/mo', '5 Voice clones', 'Analytics']
    },
    { 
      id: 'business',
      name: 'Business', 
      price: { monthly: '$100', annual: '$960' }, 
      description: 'Bulk tools, multi-account',
      features: ['2,000 AI Captions/mo', '100 Videos/mo', '500 Posts/mo', '20 Voice clones', 'Priority support']
    },
    { 
      id: 'agency',
      name: 'Agency', 
      price: { monthly: '$299', annual: '$2,870' }, 
      description: 'White-label, API access',
      features: ['Unlimited Captions', 'Unlimited Videos', 'Unlimited Posts', '50 Voice clones', 'Dedicated support']
    }
  ];

  const handleSelectTier = async (tierId) => {
    if (!user) {
      router.push('/sign-in');
      return;
    }

    if (tierId === 'free') {
      router.push('/dashboard');
      return;
    }

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierId, interval }),
      });
      
      const { url, error } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        alert(error || 'Failed to start checkout');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1>Pricing Tiers</h1>
        <p>Choose the plan that's right for you</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
          <button 
            onClick={() => setInterval('monthly')}
            style={{ 
              padding: '0.5rem 1rem', 
              borderRadius: '20px', 
              border: '1px solid #ccc',
              backgroundColor: interval === 'monthly' ? '#333' : 'white',
              color: interval === 'monthly' ? 'white' : '#333',
              cursor: 'pointer'
            }}
          >
            Monthly
          </button>
          <button 
            onClick={() => setInterval('annual')}
            style={{ 
              padding: '0.5rem 1rem', 
              borderRadius: '20px', 
              border: '1px solid #ccc',
              backgroundColor: interval === 'annual' ? '#333' : 'white',
              color: interval === 'annual' ? 'white' : '#333',
              cursor: 'pointer'
            }}
          >
            Annual (20% off)
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {tiers.map((tier) => (
          <div key={tier.name} style={{ border: '1px solid #ccc', padding: '2rem', borderRadius: '12px', backgroundColor: 'white', display: 'flex', flexDirection: 'column' }}>
            <h2>{tier.name}</h2>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '1rem 0' }}>
              {interval === 'monthly' ? tier.price.monthly : tier.price.annual}
              <span style={{ fontSize: '1rem', fontWeight: 'normal', color: '#666' }}>
                /{interval === 'monthly' ? 'mo' : 'yr'}
              </span>
            </p>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>{tier.description}</p>
            <ul style={{ padding: 0, listStyle: 'none', flexGrow: 1 }}>
              {tier.features.map(feature => (
                <li key={feature} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#2ecc71' }}>✓</span> {feature}
                </li>
              ))}
            </ul>
            <button 
              onClick={() => handleSelectTier(tier.id)}
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                backgroundColor: tier.id === 'pro' ? '#8e44ad' : '#333', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: 'pointer',
                fontWeight: 'bold',
                marginTop: '1.5rem'
              }}
            >
              {tier.id === 'free' ? 'Get Started' : `Upgrade to ${tier.name}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
