import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as api from '../api/hustlehub';
import IncomePage from '../pages/IncomePage';
import { freelancerUser, renderApp } from './utils';

vi.mock('../api/hustlehub');

const income = {
  data: {
    currency: 'ZAR',
    totalEarned: 2650,
    transactionCount: 3,
    averagePerBooking: 883.33,
    recentTransactions: [
      { id: 't1', gigTitle: 'Logo &amp; brand identity design', client: { name: 'Aisha Naidoo' }, createdAt: '2026-09-20T10:00:00Z', reference: 'TXN-ABC123DEF456', amount: 450 },
    ],
  },
};

describe('IncomePage', () => {
  beforeEach(() => {
    // People who prefer reduced motion see the final figure immediately (no count-up).
    window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener() {}, removeEventListener() {} });
    api.getIncome.mockResolvedValue(income);
  });

  it('shows the totals and the recent payments with readable titles', async () => {
    renderApp(<IncomePage />, { user: freelancerUser });
    expect(await screen.findByText('R2,650.00')).toBeInTheDocument();
    expect(screen.getByText('R883.33')).toBeInTheDocument();
    expect(screen.getByText('Logo & brand identity design')).toBeInTheDocument();
    expect(screen.getByText(/TXN-ABC123DEF456/)).toBeInTheDocument();
  });

  it('shows an encouraging empty state before the first booking', async () => {
    api.getIncome.mockResolvedValue({ data: { ...income.data, totalEarned: 0, transactionCount: 0, averagePerBooking: 0, recentTransactions: [] } });
    renderApp(<IncomePage />, { user: freelancerUser });
    expect(await screen.findByRole('heading', { name: 'No income yet' })).toBeInTheDocument();
  });

  it('shows an error when the income cannot be loaded', async () => {
    api.getIncome.mockRejectedValue(new Error('Cannot reach the server. Check your connection and try again.'));
    renderApp(<IncomePage />, { user: freelancerUser });
    expect(await screen.findByRole('alert')).toHaveTextContent('Cannot reach the server');
  });
});
