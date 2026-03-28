import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PipelineDAG } from './PipelineDAG';
import { useQuery } from 'convex/react';

// Mock Convex
vi.mock('convex/react', () => ({
  useQuery: vi.fn()
}));

vi.mock('@convex/_generated/api', () => ({
  api: {
    generationJobs: {
      list: 'generationJobs.list'
    }
  }
}));

describe('PipelineDAG', () => {
  const defaultProps = {
    sessionId: 'session-1',
    userId: 'user-1',
    onNodeClick: vi.fn()
  };

  it('renders input content node and branches', () => {
    vi.mocked(useQuery).mockReturnValue([]);
    render(<PipelineDAG {...defaultProps} />);

    expect(screen.getByText('Input Content')).toBeInTheDocument();
    // Use getAllByText because it's in both desktop and mobile views
    expect(screen.getAllByText('Text Generation')).toHaveLength(2);
    expect(screen.getAllByText('Image Generation')).toHaveLength(2);
    expect(screen.getAllByText('Video Generation')).toHaveLength(2);
  });

  it('shows pending status by default', () => {
    vi.mocked(useQuery).mockReturnValue([]);
    render(<PipelineDAG {...defaultProps} />);

    // Each branch has a badge in both views (3 * 2 = 6) + 1 in legend = 7
    const pendingBadges = screen.getAllByText('pending');
    expect(pendingBadges.length).toBeGreaterThanOrEqual(6);
  });

  it('shows processing status for jobs in progress', () => {
    vi.mocked(useQuery).mockReturnValue([
      { type: 'text', status: 'processing' }
    ]);
    render(<PipelineDAG {...defaultProps} />);

    // Should be in both views
    expect(screen.getAllByText('processing').length).toBeGreaterThanOrEqual(2);
  });

  it('shows success and error statuses', () => {
    vi.mocked(useQuery).mockReturnValue([
      { type: 'text', status: 'completed' },
      { type: 'image', status: 'failed' }
    ]);
    render(<PipelineDAG {...defaultProps} />);

    expect(screen.getAllByText('success').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('error').length).toBeGreaterThanOrEqual(2);
  });

  it('calls onNodeClick when a branch is clicked', () => {
    vi.mocked(useQuery).mockReturnValue([]);
    render(<PipelineDAG {...defaultProps} />);

    // Target by aria-label
    const textBranches = screen.getAllByLabelText('Text Generation: pending');
    fireEvent.click(textBranches[0]);
    expect(defaultProps.onNodeClick).toHaveBeenCalledWith('text');
  });
});
