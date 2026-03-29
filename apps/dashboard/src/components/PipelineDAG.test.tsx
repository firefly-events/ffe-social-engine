import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PipelineDAG from './PipelineDAG';
import { useQuery } from 'convex/react';

// Mock Convex
vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
}));

vi.mock('@convex/_generated/api', () => ({
  api: {
    generationJobs: {
      list: 'generationJobs:list',
    },
  },
}));

describe('PipelineDAG', () => {
  const defaultProps = {
    sessionId: 'session-1',
    userId: 'user-1',
    onNodeClick: vi.fn(),
  };

  it('renders correctly with pending status', () => {
    vi.mocked(useQuery).mockReturnValue([]);
    render(<PipelineDAG {...defaultProps} />);

    expect(screen.getByText('Input Content')).toBeInTheDocument();
    // Component renders twice (Desktop/Mobile), so we use getAllByText
    expect(screen.getAllByText('Text Generation').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Image Generation').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Video Generation').length).toBeGreaterThanOrEqual(1);

    // Verify badges are showing "pending"
    const badges = screen.getAllByText('pending');
    expect(badges.length).toBeGreaterThanOrEqual(3);
  });

  it('updates node status based on Convex jobs', () => {
    vi.mocked(useQuery).mockReturnValue([
      { type: 'text', status: 'completed' },
      { type: 'image', status: 'pending' },
      { type: 'video', status: 'failed' },
    ]);

    render(<PipelineDAG {...defaultProps} />);

    // Check for statuses (they appear in nodes and legend)
    expect(screen.getAllByText('success').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('pending').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('error').length).toBeGreaterThanOrEqual(1);
  });

  it('calls onNodeClick when a node is clicked', () => {
    vi.mocked(useQuery).mockReturnValue([]);
    render(<PipelineDAG {...defaultProps} />);

    // Both desktop and mobile buttons should work, pick the first one
    const textNodes = screen.getAllByLabelText('Text Generation: pending');
    fireEvent.click(textNodes[0]);

    expect(defaultProps.onNodeClick).toHaveBeenCalledWith('text');
  });

  it('shows processing status with animation', () => {
    vi.mocked(useQuery).mockReturnValue([
      { type: 'text', status: 'processing' },
    ]);

    render(<PipelineDAG {...defaultProps} />);

    const processingBadges = screen.getAllByText('processing');
    expect(processingBadges.length).toBeGreaterThanOrEqual(1);
    
    // Check if the button has the processing classes (animate-pulse)
    const textNodes = screen.getAllByLabelText('Text Generation: processing');
    expect(textNodes[0].className).toContain('animate-pulse');
  });

  it('handles mixed job statuses correctly', () => {
    vi.mocked(useQuery).mockReturnValue([
      { type: 'text', status: 'completed' },
      { type: 'image', status: 'processing' },
    ]);

    render(<PipelineDAG {...defaultProps} />);

    expect(screen.getAllByText('success').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('processing').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('pending').length).toBeGreaterThanOrEqual(1);
  });
});
