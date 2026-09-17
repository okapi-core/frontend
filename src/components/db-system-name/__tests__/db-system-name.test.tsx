import { renderWithProviders } from '@/test/utils';
import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { DbSystemName } from '../db-system-name';

it('renders the db system name value as a button', () => {
  const onClick = vi.fn();
  const { Wrapper } = renderWithProviders(<></>);

  render(<DbSystemName val="postgresql" onClick={onClick} />, {
    wrapper: Wrapper,
  });

  expect(
    screen.getByRole('button', { name: 'postgresql' }),
  ).toBeInTheDocument();
});
