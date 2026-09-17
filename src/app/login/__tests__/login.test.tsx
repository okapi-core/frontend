import { renderWithProviders } from '@/test/utils';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import LoginPage from '../page';

const signInWithPass = vi.fn();
const createUser = vi.fn();

vi.mock('@/lib/api', () => ({
  signInWithPass: (...args: unknown[]) => signInWithPass(...args),
  createUser: (...args: unknown[]) => createUser(...args),
}));

beforeEach(() => {
  vi.clearAllMocks();
  signInWithPass.mockResolvedValue({ data: 'ok' });
});

function renderLogin() {
  const { Wrapper } = renderWithProviders(<></>);
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </MemoryRouter>,
    { wrapper: Wrapper },
  );
}

it('submits login via signInWithPass', async () => {
  const user = userEvent.setup();
  renderLogin();

  await user.type(screen.getByLabelText(/email/i), 'test@example.com');
  await user.type(screen.getByLabelText(/password/i), 'password123');
  await user.click(screen.getByRole('button', { name: 'Sign in' }));

  await waitFor(() => expect(signInWithPass).toHaveBeenCalled());
  const call = signInWithPass.mock.calls.at(-1)?.[0] as any;
  expect(call.request).toEqual({
    email: 'test@example.com',
    password: 'password123',
  });
  expect(createUser).not.toHaveBeenCalled();
});
