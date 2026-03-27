import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CreatePage from '../src/app/(dashboard)/create/page';
import TemplatePage from '../src/app/(dashboard)/create/[templateId]/page';
import React from 'react';
import { useParams, useRouter } from 'next/navigation';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    back: vi.fn(),
  })),
  useParams: vi.fn(() => ({
    templateId: 'product-launch'
  }))
}));

describe('Create Flow', () => {
  it('renders all 6 templates on the create page', () => {
    render(<CreatePage />);
    expect(screen.getByText('Product Launch')).toBeInTheDocument();
    expect(screen.getByText('Behind the Scenes')).toBeInTheDocument();
    expect(screen.getByText('Tutorial / How-To')).toBeInTheDocument();
    expect(screen.getByText('Trending Topic')).toBeInTheDocument();
    expect(screen.getByText('Event Promo')).toBeInTheDocument();
    expect(screen.getByText('Start from Scratch')).toBeInTheDocument();
  });

  it('renders the event-promo template with correct fields', () => {
    vi.mocked(useParams).mockReturnValue({ templateId: 'event-promo' });
    
    render(<TemplatePage />);
    expect(screen.getByText('Event Promo')).toBeInTheDocument();
    expect(screen.getByText(/Event Name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g. Summer Festival/i)).toBeInTheDocument();
    expect(screen.getByText(/Venue/i)).toBeInTheDocument();
  });

  it('renders the scratch template with correct fields', () => {
    vi.mocked(useParams).mockReturnValue({ templateId: 'scratch' });
    
    render(<TemplatePage />);
    expect(screen.getByText('Start from Scratch')).toBeInTheDocument();
    expect(screen.getByText(/What are we writing about?/i)).toBeInTheDocument();
    expect(screen.getByText(/Tone/i)).toBeInTheDocument();
    expect(screen.getByText(/Target Platform/i)).toBeInTheDocument();
  });

  it('renders template not found for invalid ID', () => {
    vi.mocked(useParams).mockReturnValue({ templateId: 'invalid-id' });
    
    render(<TemplatePage />);
    expect(screen.getByText(/Template not found: invalid-id/i)).toBeInTheDocument();
  });
});
