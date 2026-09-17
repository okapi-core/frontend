import { renderWithProviders } from '@/test/utils';
import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { HttpMethodValue } from '../http-method-value';

it('renders the http method value as a button', () => {
  const onClick = vi.fn();
  const { Wrapper } = renderWithProviders(<></>);

  render(<HttpMethodValue val="GET" onClick={onClick} />, {
    wrapper: Wrapper,
  });

  expect(screen.getByRole('button', { name: 'GET' })).toBeInTheDocument();
});
