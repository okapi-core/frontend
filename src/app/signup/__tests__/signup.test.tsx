import { renderWithProviders } from '@/test/utils';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SignupPage from '../page';

const createUser = vi.fn();
const signInWithPass = vi.fn();

vi.mock('@/lib/api', () => ({
  createUser: (...args: unknown[]) => createUser(...args),
  signInWithPass: (...args: unknown[]) => signInWithPass(...args),
}));

beforeEach(() => {
  vi.clearAllMocks();
  createUser.mockResolvedValue({ data: { token: 'ok' } });
});

function renderSignup() {
  const { Wrapper } = renderWithProviders(<></>);
  return render(
    <MemoryRouter initialEntries={['/signup']}>
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </MemoryRouter>,
    { wrapper: Wrapper },
  );
}

it('submits signup via createUser', async () => {
  const user = userEvent.setup();
  renderSignup();

  await user.type(screen.getByLabelText(/email/i), 'new@example.com');
  const passwordInputs = screen.getAllByLabelText(/password/i);
  await user.type(passwordInputs[0], 'password123');
  await user.type(passwordInputs[1], 'password123');
  await user.click(screen.getByRole('button', { name: 'Create Account' }));

  await waitFor(() => expect(createUser).toHaveBeenCalled());
  const call = createUser.mock.calls.at(-1)?.[0] as any;
  expect(call.request).toEqual({
    email: 'new@example.com',
    password: 'password123',
  });
  expect(signInWithPass).not.toHaveBeenCalled();
});
