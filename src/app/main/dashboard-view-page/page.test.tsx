import { renderWithProviders } from '@/test/utils';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';
import DashboardViewPage from './page';
import { useDashboardViewStore } from './store';

const listVars = vi.fn();
const getDashboardVersion = vi.fn();
const getVarHints = vi.fn();
const QueryPlotterMock = vi.fn();

vi.mock('@/lib/api', () => ({
  listVars: (...args: unknown[]) => listVars(...args),
  getDashboardVersion: (...args: unknown[]) => getDashboardVersion(...args),
  getVarHints: (...args: unknown[]) => getVarHints(...args),
}));

vi.mock('@/lib/context', () => ({
  useUserData: () => ({
    currentOrg: { orgId: 'org-1' },
    orgs: { orgs: [] },
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return {
    ...actual,
    useParams: () => ({ slug: 'dash-1', dashVersion: 'v1' }),
  };
});

vi.mock('@/components/page-canvas', () => ({
  PageCanvas: ({ inner }: { inner: React.ReactNode }) => <div>{inner}</div>,
}));

vi.mock('@/components/custom-component-tray/time-range-picker', () => ({
  default: ({
    onChange,
  }: {
    onChange: (v: { startMs: number; endMs: number }) => void;
  }) => (
    <button
      type="button"
      onClick={() => onChange({ startMs: 111, endMs: 222 })}
    >
      Pick range
    </button>
  ),
}));

vi.mock('@/features/dashboards/components/panel/PanelContentSwitch', () => ({
  QueryPlotter: (props: unknown) => {
    QueryPlotterMock(props);
    return <div data-testid="query-plotter" />;
  },
}));

vi.mock('@/components/grid/GridBoard', () => ({
  GridBoard: ({ items }: { items: Record<string, React.ReactNode> }) => (
    <div>
      {Object.values(items).map((node, idx) => (
        <div key={idx}>{node}</div>
      ))}
    </div>
  ),
}));

const DASHBOARD_RESPONSE = {
  dashboardId: 'dash-1',
  title: 'Dashboard',
  description: '',
  rows: [
    {
      rowId: 'row-1',
      title: 'Row',
      panels: [
        {
          panelId: 'panel-1',
          title: 'Panel 1',
          queryConfig: {
            queries: [
              {
                expectedType: 'TIME_MATRIX',
                query: JSON.stringify({
                  svc: 'none',
                  metric: 'rate',
                  tags: { host: 'localhost' },
                  start: 0,
                  end: 0,
                }),
              },
            ],
          },
        },
      ],
      panelOrder: ['panel-1'],
    },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  useDashboardViewStore.setState({
    timeRange: { startMs: 0, endMs: 0 },
    varsCtx: {},
  });
  getDashboardVersion.mockResolvedValue({ data: DASHBOARD_RESPONSE });
  listVars.mockResolvedValue({
    data: { vars: [{ name: 'service' }, { name: 'env' }] },
  });
  getVarHints.mockResolvedValue({ data: { suggestions: [] } });
});

function renderDashboardView() {
  const { Wrapper } = renderWithProviders(<></>);
  return render(<DashboardViewPage />, { wrapper: Wrapper });
}

it('passes variable values to QueryPlotter', async () => {
  const user = userEvent.setup();
  renderDashboardView();

  const serviceInput = await screen.findByRole('textbox', {
    name: 'service',
  });
  await user.clear(serviceInput);
  await user.type(serviceInput, 'payments');
  fireEvent.keyDown(serviceInput, { key: 'Enter' });

  await waitFor(() => expect(QueryPlotterMock).toHaveBeenCalled());
  const call = QueryPlotterMock.mock.calls.at(-1)?.[0] as any;
  expect(call.varsCtx).toEqual({ service: 'payments' });
});

it('applies time range to QueryPlotter', async () => {
  renderDashboardView();
  await waitFor(() => expect(QueryPlotterMock).toHaveBeenCalled());

  await userEvent.click(screen.getByRole('button', { name: 'Pick range' }));

  await waitFor(() => expect(QueryPlotterMock).toHaveBeenCalled());
  const call = QueryPlotterMock.mock.calls.at(-1)?.[0] as any;
  expect(call.timeConstraint).toEqual({ startMs: 111, endMs: 222 });
});

it('refetches var hints with updated time range', async () => {
  const user = userEvent.setup();
  renderDashboardView();

  const serviceInput = await screen.findByRole('textbox', { name: 'service' });
  await user.click(serviceInput);
  await waitFor(() => expect(getVarHints).toHaveBeenCalled());
  getVarHints.mockClear();

  await userEvent.click(screen.getByRole('button', { name: 'Pick range' }));

  await waitFor(() => expect(getVarHints).toHaveBeenCalled());
  const call = getVarHints.mock.calls.at(-1)?.[0] as any;
  expect(call.request?.constraint).toEqual({ start: 111, end: 222 });
});
