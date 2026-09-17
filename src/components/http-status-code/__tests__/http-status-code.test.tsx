import { renderWithProviders } from '@/test/utils';
import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { HttpStatusCode } from '../http-status-code';

it('renders the status code value as a button', () => {
  const onClick = vi.fn();
  const { Wrapper } = renderWithProviders(<></>);

  render(<HttpStatusCode val={200} onClick={onClick} />, {
    wrapper: Wrapper,
  });

  expect(screen.getByRole('button', { name: '200' })).toBeInTheDocument();
});
