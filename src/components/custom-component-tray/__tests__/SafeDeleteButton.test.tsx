import { renderWithProviders } from '@/test/utils';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import SafeDeleteButton from '../safe-delete-button';

afterEach(() => {
  vi.useRealTimers();
});

it('requires two clicks to confirm', async () => {
  const onConfirm = vi.fn();
  const user = userEvent.setup();
  const { Wrapper } = renderWithProviders(<></>);

  render(<SafeDeleteButton onConfirm={onConfirm} />, { wrapper: Wrapper });

  await user.click(screen.getByRole('button', { name: 'Delete' }));
  expect(onConfirm).not.toHaveBeenCalled();
  expect(
    screen.getByRole('button', { name: 'Click again to delete' }),
  ).toBeInTheDocument();

  await user.click(
    screen.getByRole('button', { name: 'Click again to delete' }),
  );
  expect(onConfirm).toHaveBeenCalledTimes(1);
});

it('resets if confirm timeout elapses', () => {
  vi.useFakeTimers();
  const onConfirm = vi.fn();
  const { Wrapper } = renderWithProviders(<></>);

  render(<SafeDeleteButton onConfirm={onConfirm} confirmTimeoutMs={10} />, {
    wrapper: Wrapper,
  });

  fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
  expect(
    screen.getByRole('button', { name: 'Click again to delete' }),
  ).toBeInTheDocument();

  act(() => {
    vi.advanceTimersByTime(10);
  });

  expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
  expect(onConfirm).not.toHaveBeenCalled();
});
