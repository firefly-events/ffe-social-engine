import { render, screen } from '@testing-library/react';
import DashboardPage from '../app/dashboard/page';

describe('DashboardPage', () => {
  it('renders a heading', () => {
    render(<DashboardPage />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Generated Content');
  });

  it('renders dummy content items', () => {
    render(<DashboardPage />);
    expect(screen.getByText('event-promo')).toBeInTheDocument();
    expect(screen.getByText('poetry')).toBeInTheDocument();
  });
});
