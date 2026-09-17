import { expect, test } from '../fixtures/api';
import {
  createOscarFlowHandlers,
  createOscarFlowState,
  markdownMessage,
  responseMessage,
  userMessage,
} from '../mocks/oscar-handlers';

const initialPrompt = 'Investigate checkout latency';

test.describe('Oscar chat flow', () => {
  test('starts from Oscar home and renders streamed typed responses', async ({
    page,
    useApiHandlers,
  }) => {
    const state = createOscarFlowState({
      sessionId: 'session-home-e2e',
      history: [
        userMessage({
          id: 1,
          timestamp: 1_710_000_000_000,
          contents: initialPrompt,
        }),
      ],
      updateStreams: [
        {
          messages: [
            markdownMessage({
              id: 2,
              timestamp: 1_710_000_001_000,
              contents: 'Oscar found elevated p95 latency.',
            }),
            responseMessage({
              id: 3,
              timestamp: 1_710_000_002_000,
              response: 'The checkout API slowed after the deploy.',
            }),
          ],
          streamState: 'FIN',
        },
      ],
    });
    useApiHandlers(...createOscarFlowHandlers(state));

    await page.goto('/main/oscar');
    await page
      .getByPlaceholder('Describe the issue or ask Oscar to investigate…')
      .fill(initialPrompt);
    await page.getByRole('button', { name: 'Start' }).click();

    await expect(page).toHaveURL(/\/main\/chat\/session-home-e2e$/);
    await expect
      .poll(() => state.createRequests)
      .toEqual([{ initialMsg: initialPrompt }]);
    await expect.poll(() => state.historyRequests.length).toBeGreaterThan(0);
    expect(state.historyRequests[0]).toEqual({ from: 0 });
    await expect.poll(() => state.updateRequestCount).toBeGreaterThan(0);

    const messages = page.getByTestId('transcript-message');
    await expect(messages).toHaveCount(3);
    await expect(messages.nth(0)).toContainText(initialPrompt);
    await expect(messages.nth(1)).toContainText(
      'Oscar found elevated p95 latency.',
    );
    await expect(messages.nth(2)).toContainText(
      'The checkout API slowed after the deploy.',
    );

    await expect(
      messages.nth(0).getByTestId('message-timestamp'),
    ).toContainText(/\d/);
    await expect(
      messages.nth(1).getByTestId('message-timestamp'),
    ).toContainText(/\d/);
    await expect(
      messages.nth(2).getByTestId('message-timestamp'),
    ).toContainText(/\d/);
    await expect(messages.nth(1).getByTestId('copy-message')).toBeVisible();
    await expect(messages.nth(2).getByTestId('copy-message')).toBeVisible();
  });

  test('loads a session directly, preserves history, and appends new streamed responses', async ({
    page,
    useApiHandlers,
  }) => {
    const newStreamTimestamp = Date.now() + 60_000;
    const state = createOscarFlowState({
      sessionId: 'session-direct-e2e',
      history: [
        userMessage({
          id: 10,
          timestamp: 1_710_000_000_000,
          contents: 'Original investigation',
        }),
        markdownMessage({
          id: 11,
          timestamp: 1_710_000_001_000,
          contents: 'Historical assistant summary.',
        }),
        responseMessage({
          id: 12,
          timestamp: 1_710_000_002_000,
          response: 'Historical typed response.',
        }),
      ],
      updateStreams: [
        { messages: [], streamState: 'FIN' },
        {
          messages: [
            markdownMessage({
              id: 13,
              timestamp: newStreamTimestamp,
              contents: 'New streamed finding.',
            }),
            responseMessage({
              id: 14,
              timestamp: newStreamTimestamp + 1_000,
              response: 'New typed conclusion.',
            }),
          ],
          streamState: 'FIN',
        },
      ],
    });
    useApiHandlers(...createOscarFlowHandlers(state));

    await page.goto('/main/chat/session-direct-e2e');

    await expect.poll(() => state.historyRequests.length).toBeGreaterThan(0);
    expect(state.historyRequests[0]).toEqual({ from: 0 });

    const messages = page.getByTestId('transcript-message');
    await expect(messages).toHaveCount(3);
    await expect(messages.nth(0)).toContainText('Original investigation');
    await expect(messages.nth(1)).toContainText('Historical assistant summary.');
    await expect(messages.nth(2)).toContainText('Historical typed response.');

    await page
      .getByPlaceholder('Ask Oscar anything about your traces or metrics…')
      .fill('What changed next?');
    await page.getByRole('button', { name: 'Send message' }).click();

    await expect
      .poll(() => state.postRequests)
      .toEqual([{ message: 'What changed next?', userId: 'user-e2e' }]);
    await expect.poll(() => state.updateRequestCount).toBeGreaterThan(1);

    await expect(messages).toHaveCount(6);
    await expect(messages.nth(0)).toContainText('Original investigation');
    await expect(messages.nth(1)).toContainText('Historical assistant summary.');
    await expect(messages.nth(2)).toContainText('Historical typed response.');
    await expect(messages.nth(3)).toContainText('What changed next?');
    await expect(messages.nth(4)).toContainText('New streamed finding.');
    await expect(messages.nth(5)).toContainText('New typed conclusion.');

    await expect(
      messages.nth(5).getByTestId('message-timestamp'),
    ).toContainText(/\d/);
    await expect(messages.nth(5).getByTestId('copy-message')).toBeVisible();
  });
});
