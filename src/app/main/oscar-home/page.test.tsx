import { renderWithProviders } from '@/test/utils';
import { createTestAppServices } from '@/lib/app-services';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import OscarHome from './page';

const createSession = vi.fn();
const getHistory = vi.fn();
const getSessionMeta = vi.fn();
const getUpdates = vi.fn();
const postMessage = vi.fn();
const listChats = vi.fn();
const notifyError = vi.fn();
const navigateMock = vi.fn();

const userData = {
  currentOrg: { orgId: 'org-1' },
  orgs: { orgs: [] },
};

vi.mock('@/lib/api', () => ({
  createSession: (...args: unknown[]) => createSession(...args),
  getHistory: (...args: unknown[]) => getHistory(...args),
  getSessionMeta: (...args: unknown[]) => getSessionMeta(...args),
  getUpdates: (...args: unknown[]) => getUpdates(...args),
  postMessage: (...args: unknown[]) => postMessage(...args),
  listChats: (...args: unknown[]) => listChats(...args),
}));

vi.mock('@/lib/context', () => ({
  useUserData: (selector?: (state: typeof userData) => unknown) =>
    selector ? selector(userData) : userData,
}));

vi.mock('@/components/page-canvas', () => ({
  PageCanvas: ({ inner }: { inner: React.ReactNode }) => <div>{inner}</div>,
}));

beforeEach(() => {
  vi.clearAllMocks();
  createSession.mockResolvedValue({ data: { sessionId: 'session-1' } });
  listChats.mockResolvedValue({ data: { chats: [] } });
});

function renderHome() {
  const { Wrapper } = renderWithProviders(<></>, {
    appServices: createTestAppServices({
      notify: { error: notifyError },
      navigation: { navigate: navigateMock },
    }),
  });
  return render(
    <MemoryRouter initialEntries={['/main/oscar']}>
      <Routes>
        <Route path="/main/oscar" element={<OscarHome />} />
        <Route
          path="/main/chat/:sessionId"
          element={<div>Session reached</div>}
        />
      </Routes>
    </MemoryRouter>,
    { wrapper: Wrapper },
  );
}

it('starts a new Oscar session from the initial prompt', async () => {
  const user = userEvent.setup();
  renderHome();

  const input = screen.getByPlaceholderText(
    'Describe the issue or ask Oscar to investigate…',
  );
  await user.type(input, ' investigate checkout latency ');
  await user.click(screen.getByRole('button', { name: 'Start' }));

  await waitFor(() =>
    expect(createSession).toHaveBeenCalledWith({
      request: { initialMsg: 'investigate checkout latency' },
    }),
  );
  expect(navigateMock).toHaveBeenCalledWith('/main/chat/session-1');
});

it('keeps the home route isolated from existing-session APIs', () => {
  renderHome();

  expect(getHistory).not.toHaveBeenCalled();
  expect(getSessionMeta).not.toHaveBeenCalled();
  expect(getUpdates).not.toHaveBeenCalled();
  expect(postMessage).not.toHaveBeenCalled();
});

it('renders recent Oscar chats', async () => {
  listChats.mockResolvedValue({
    data: {
      chats: [
        {
          sessionId: 'session-2',
          title: 'Checkout latency',
          createdAt: 1_700_000_000_000,
          messagesByUser: 2,
          messagesByAgent: 3,
        },
      ],
    },
  });

  renderHome();

  expect(await screen.findByText('Checkout latency')).toBeInTheDocument();
  expect(screen.getByText('Recent chats')).toBeInTheDocument();
  expect(screen.getByText('5 messages')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Open' })).toHaveAttribute(
    'href',
    '/main/chat/session-2',
  );
});

it('refetches recent Oscar chats when the interval changes', async () => {
  const user = userEvent.setup();
  renderHome();

  await screen.findByText('Recent chats');
  const firstRequest = listChats.mock.calls[0][0].request;

  await user.click(screen.getByRole('button', { name: '5 days' }));

  await waitFor(() => expect(listChats).toHaveBeenCalledTimes(2));
  const secondRequest = listChats.mock.calls[1][0].request;
  expect(secondRequest.to - secondRequest.from).toBe(5 * 24 * 60 * 60 * 1000);
  expect(firstRequest.to - firstRequest.from).toBe(24 * 60 * 60 * 1000);
});

it('does not submit an empty initial message', async () => {
  const user = userEvent.setup();
  renderHome();

  expect(screen.getByRole('button', { name: 'Start' })).toBeDisabled();

  await user.type(
    screen.getByPlaceholderText(
      'Describe the issue or ask Oscar to investigate…',
    ),
    '   ',
  );
  await user.click(screen.getByRole('button', { name: 'Start' }));

  expect(createSession).not.toHaveBeenCalled();
});

it('shows a toast with the backend message and stays on Oscar home when session creation returns a 4xx', async () => {
  const user = userEvent.setup();
  createSession.mockResolvedValue({
    error: 'Oscar cannot start a session for this request.',
    statusCode: 400,
  });
  renderHome();

  await user.type(
    screen.getByPlaceholderText(
      'Describe the issue or ask Oscar to investigate…',
    ),
    'investigate checkout latency',
  );
  await user.click(screen.getByRole('button', { name: 'Start' }));

  await waitFor(() =>
    expect(notifyError).toHaveBeenCalledWith(
      'Oscar cannot start a session for this request.',
    ),
  );
  expect(screen.queryByText('Session reached')).not.toBeInTheDocument();
  expect(
    screen.getByRole('heading', {
      name: 'What would you like Oscar to investigate?',
    }),
  ).toBeInTheDocument();
});

it('shows a toast with a generic server message and stays on Oscar home when session creation returns a 5xx', async () => {
  const user = userEvent.setup();
  createSession.mockResolvedValue({
    error: 'database is unavailable',
    statusCode: 503,
  });
  renderHome();

  await user.type(
    screen.getByPlaceholderText(
      'Describe the issue or ask Oscar to investigate…',
    ),
    'investigate checkout latency',
  );
  await user.click(screen.getByRole('button', { name: 'Start' }));

  await waitFor(() =>
    expect(notifyError).toHaveBeenCalledWith(
      'Something went wrong on the server.',
    ),
  );
  expect(screen.queryByText('Session reached')).not.toBeInTheDocument();
  expect(
    screen.getByRole('heading', {
      name: 'What would you like Oscar to investigate?',
    }),
  ).toBeInTheDocument();
});
