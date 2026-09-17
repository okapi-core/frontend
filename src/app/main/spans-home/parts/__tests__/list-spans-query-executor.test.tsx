import { SpanQueryV2Request } from '@/lib/request-types';
import { SpanRowV2 } from '@/lib/response-types';
import { renderWithProviders } from '@/test/utils';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import { resetSpansHomeStore, useSpansHomeStore } from '../../store';
import { ListSpansQueryExecutor } from '../list-spans-query-executor';

const querySpans = vi.fn();

vi.mock('@/lib/domain/spans', () => ({
  useSpansApi: () => ({
    querySpans,
  }),
}));

const timeRange = { startMs: 1000, endMs: 2000 };

function resetStore() {
  resetSpansHomeStore({
    timeRange,
    listItems: [],
    listError: undefined,
    spanSearchQueryStatus: 'initial',
  });
}

let currentLocation = '';

function LocationProbe() {
  const location = useLocation();
  currentLocation = `${location.pathname}${location.search}`;
  return null;
}

function renderExecutor(initialEntry = '/main/spans') {
  const { Wrapper } = renderWithProviders(<></>);
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <ListSpansQueryExecutor />
      <LocationProbe />
    </MemoryRouter>,
    { wrapper: Wrapper },
  );
}

function successfulResponse(items: SpanRowV2[]) {
  return { data: { items } };
}

const baseRequest: SpanQueryV2Request = {
  timestampFilter: {
    tsStartNanos: 1_000_000_000,
    tsEndNanos: 2_000_000_000,
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  currentLocation = '';
  resetStore();
});

it('is enabled without token state', () => {
  renderExecutor();

  expect(screen.getByRole('button', { name: 'Run query' })).toBeEnabled();
});

it('submits the expected request and stores results when a filter is set', async () => {
  const user = userEvent.setup();
  const item: SpanRowV2 = {
    traceId: 'trace-1',
    spanId: 'span-1',
    serviceName: 'checkout',
  };
  querySpans.mockResolvedValueOnce(successfulResponse([item]));
  useSpansHomeStore.getState().setServiceName('checkout');
  renderExecutor();

  expect(screen.getByText('Filters changed')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Run query' }));

  await waitFor(() => expect(querySpans).toHaveBeenCalledTimes(1));
  expect(querySpans).toHaveBeenCalledWith({
    ...baseRequest,
    serviceFilter: {
      service: 'checkout',
    },
  });
  await waitFor(() =>
    expect(useSpansHomeStore.getState().spanSearchQueryStatus).toEqual('done'),
  );
  expect(useSpansHomeStore.getState().listItems).toEqual([item]);
  expect(useSpansHomeStore.getState().listError).toBeUndefined();
});

it('submits the expected request and stores results when no filters are set', async () => {
  const user = userEvent.setup();
  const item: SpanRowV2 = {
    traceId: 'trace-2',
    spanId: 'span-2',
    serviceName: 'payments',
  };
  querySpans.mockResolvedValueOnce(successfulResponse([item]));
  renderExecutor();

  expect(screen.queryByText('Filters changed')).not.toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Run query' }));

  await waitFor(() => expect(querySpans).toHaveBeenCalledTimes(1));
  expect(querySpans).toHaveBeenCalledWith(baseRequest);
  await waitFor(() =>
    expect(useSpansHomeStore.getState().spanSearchQueryStatus).toEqual('done'),
  );
  expect(useSpansHomeStore.getState().listItems).toEqual([item]);
  expect(useSpansHomeStore.getState().listError).toBeUndefined();
});

it('runs the query when span filters are present on first load', async () => {
  const item: SpanRowV2 = {
    traceId: 'trace-3',
    spanId: 'span-3',
    serviceName: 'checkout',
  };
  querySpans.mockResolvedValueOnce(successfulResponse([item]));
  const filters = {
    timeRange,
    serviceName: 'checkout',
  };

  renderExecutor(
    `/main/spans?span_filters=${encodeURIComponent(JSON.stringify(filters))}`,
  );

  await waitFor(() => expect(querySpans).toHaveBeenCalledTimes(1));
  expect(querySpans).toHaveBeenCalledWith({
    ...baseRequest,
    serviceFilter: {
      service: 'checkout',
    },
  });
  await waitFor(() =>
    expect(useSpansHomeStore.getState().spanSearchQueryStatus).toEqual('done'),
  );
  expect(useSpansHomeStore.getState().listItems).toEqual([item]);
});

it('clears stale results while a new query is pending', async () => {
  const user = userEvent.setup();
  const oldItem: SpanRowV2 = {
    traceId: 'old-trace',
    spanId: 'old-span',
  };
  let resolveQuery: (value: ReturnType<typeof successfulResponse>) => void;
  querySpans.mockReturnValueOnce(
    new Promise((resolve) => {
      resolveQuery = resolve;
    }),
  );
  resetSpansHomeStore({
    timeRange,
    listItems: [oldItem],
    spanSearchQueryStatus: 'initial',
  });
  renderExecutor();

  await user.click(screen.getByRole('button', { name: 'Run query' }));

  await waitFor(() =>
    expect(useSpansHomeStore.getState().spanSearchQueryStatus).toEqual(
      'pending',
    ),
  );
  expect(useSpansHomeStore.getState().listItems).toEqual([]);

  const newItem: SpanRowV2 = {
    traceId: 'new-trace',
    spanId: 'new-span',
  };
  resolveQuery!(successfulResponse([newItem]));

  await waitFor(() =>
    expect(useSpansHomeStore.getState().spanSearchQueryStatus).toEqual('done'),
  );
  expect(useSpansHomeStore.getState().listItems).toEqual([newItem]);
});

it('stores the error and marks the query failed when the spans API fails', async () => {
  const user = userEvent.setup();
  querySpans.mockResolvedValueOnce({
    error: 'spans backend unavailable',
    statusCode: 503,
  });
  renderExecutor();

  await user.click(screen.getByRole('button', { name: 'Run query' }));

  await waitFor(() => expect(querySpans).toHaveBeenCalledWith(baseRequest));
  await waitFor(() =>
    expect(useSpansHomeStore.getState().spanSearchQueryStatus).toEqual(
      'failed',
    ),
  );
  expect(useSpansHomeStore.getState().listError).toEqual(
    'spans backend unavailable',
  );
  expect(useSpansHomeStore.getState().listItems).toEqual([]);
});
