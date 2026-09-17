import { renderWithProviders } from '@/test/utils';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import OscarSession from './page';
import { useOscarChatStore } from '../oscar-chat/store';

const createSession = vi.fn();
const getHistory = vi.fn();
const getSessionMeta = vi.fn();
const getUpdates = vi.fn();
const postMessage = vi.fn();
const pollUntil = vi.fn();

const userData = {
  userProfile: { id: 'user-1' },
  currentOrg: { orgId: 'org-1' },
  orgs: { orgs: [] },
};

vi.mock('@/lib/api', () => ({
  createSession: (...args: unknown[]) => createSession(...args),
  getHistory: (...args: unknown[]) => getHistory(...args),
  getSessionMeta: (...args: unknown[]) => getSessionMeta(...args),
  getUpdates: (...args: unknown[]) => getUpdates(...args),
  postMessage: (...args: unknown[]) => postMessage(...args),
}));

vi.mock('@/lib/context', () => ({
  useUserData: (selector?: (state: typeof userData) => unknown) =>
    selector ? selector(userData) : userData,
}));

vi.mock('@/lib/poll-until', () => ({
  pollUntil: (...args: unknown[]) => pollUntil(...args),
}));

vi.mock('@/components/page-canvas', () => ({
  PageCanvas: ({ inner }: { inner: React.ReactNode }) => <div>{inner}</div>,
}));

vi.mock('../oscar-chat/parts/chat-side-bar', () => ({
  ChatSideBar: () => null,
}));

vi.mock('../oscar-chat/parts/chat-payload-message', () => ({
  ChatPayloadMessage: ({ response }: { response: { contents: string } }) => (
    <div>{response.contents}</div>
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
  useOscarChatStore.getState().resetSession('');
  getHistory.mockResolvedValue({
    data: {
      responses: [
        {
          id: 1,
          timestamp: 100,
          contents: 'Initial user question',
          eventStreamId: 1,
          role: 'USER',
        },
        {
          id: 2,
          timestamp: 200,
          contents: 'Initial assistant answer',
          eventStreamId: 1,
          responseType: 'MARKDOWN_TEXT',
          role: 'ASSISTANT',
        },
      ],
    },
  });
  getSessionMeta.mockResolvedValue({
    data: { sessionId: 'session-1', state: 'CLOSED' },
  });
  getUpdates.mockResolvedValue({ data: { messages: [], streamState: 'FIN' } });
  postMessage.mockResolvedValue({
    data: { sessionId: 'session-1', streamId: 'stream-1' },
  });
  pollUntil.mockReturnValue(vi.fn());
});

function renderSession() {
  const { Wrapper } = renderWithProviders(<></>);
  return render(
    <MemoryRouter initialEntries={['/main/chat/session-1']}>
      <Routes>
        <Route path="/main/chat/:sessionId" element={<OscarSession />} />
      </Routes>
    </MemoryRouter>,
    { wrapper: Wrapper },
  );
}

it('loads an existing Oscar session without creating a new one', async () => {
  renderSession();

  await waitFor(() =>
    expect(getHistory).toHaveBeenCalledWith({
      sessionId: 'session-1',
      request: { from: 0 },
    }),
  );
  expect(getSessionMeta).toHaveBeenCalledWith({
    sessionId: 'session-1',
  });
  expect(createSession).not.toHaveBeenCalled();
  expect(await screen.findByText('Initial user question')).toBeInTheDocument();
  expect(
    await screen.findByText('Initial assistant answer'),
  ).toBeInTheDocument();
});

it('starts polling when the existing session is open', async () => {
  getSessionMeta.mockResolvedValue({
    data: { sessionId: 'session-1', state: 'OPEN' },
  });

  renderSession();

  await waitFor(() => expect(pollUntil).toHaveBeenCalled());
  expect(screen.getByText('Oscar is working…')).toBeInTheDocument();
});

it('posts follow-up messages to the current session', async () => {
  const user = userEvent.setup();
  renderSession();

  const input = await screen.findByPlaceholderText(
    'Ask Oscar anything about your traces or metrics…',
  );
  await user.type(input, 'what changed?');
  await user.click(screen.getByRole('button'));

  await waitFor(() =>
    expect(postMessage).toHaveBeenCalledWith({
      sessionId: 'session-1',
      request: { message: 'what changed?', userId: 'user-1' },
    }),
  );
});
