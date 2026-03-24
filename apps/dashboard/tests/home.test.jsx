import { render } from '@testing-library/react';
import Home from '../app/(marketing)/page';
import { redirect } from 'next/navigation';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

describe('Home', () => {
  it('redirects to /dashboard', () => {
    render(<Home />);
    expect(redirect).toHaveBeenCalledWith('/dashboard');
  });
});
