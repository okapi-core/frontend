import { renderWithProviders } from '@/test/utils';
import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { DbOperationName } from '../db-operation-name';

it('renders the db operation value as a button', () => {
  const onClick = vi.fn();
  const { Wrapper } = renderWithProviders(<></>);
  const value = 'SELECT * FROM users';

  render(<DbOperationName val={value} onClick={onClick} />, {
    wrapper: Wrapper,
  });

  expect(screen.getByRole('button')).toHaveAttribute('title', value);
});
