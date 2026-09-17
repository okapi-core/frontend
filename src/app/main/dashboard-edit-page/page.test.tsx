import { renderWithProviders } from '@/test/utils';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import DashboardEditPage from './page';
import { useDashboardEditStore } from './store';

const listVars = vi.fn();
const createVar = vi.fn();
const deleteVar = vi.fn();
const getVarHints = vi.fn();
const getDashboard = vi.fn();
const DashboardPanelRendererMock = vi.fn();

vi.mock('@/lib/api', () => ({
  getDashboardVersion: (...args: unknown[]) => getDashboard(...args),
  createPanel: vi.fn(),
  createRow: vi.fn(),
  deletePanel: vi.fn(),
  deleteRow: vi.fn(),
  updateDashboard: vi.fn(),
  updateRow: vi.fn(),
  listVars: (...args: unknown[]) => listVars(...args),
  createVar: (...args: unknown[]) => createVar(...args),
  deleteVar: (...args: unknown[]) => deleteVar(...args),
  getVarHints: (...args: unknown[]) => getVarHints(...args),
}));

vi.mock('@/lib/context', () => ({
  useUserData: () => ({
    currentOrg: { orgId: 'org-1' },
    orgs: { orgs: [] },
  }),
}));

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
      onClick={() => onChange({ startMs: 333, endMs: 444 })}
    >
      Pick range
    </button>
  ),
}));

vi.mock('@/features/dashboards/components/PanelRenderer', () => ({
  DashboardPanelRenderer: (props: unknown) => {
    DashboardPanelRendererMock(props);
    return <div data-testid="panel-renderer" />;
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
  useDashboardEditStore.setState({
    timeRange: { startMs: 0, endMs: 0 },
    varsCtx: {},
    manageVarsOpen: false,
  });
  getDashboard.mockResolvedValue({ data: DASHBOARD_RESPONSE });
  listVars.mockResolvedValue({
    data: { vars: [{ name: 'service' }, { name: 'env' }] },
  });
  createVar.mockResolvedValue({ data: {} });
  deleteVar.mockResolvedValue({ data: {} });
  getVarHints.mockResolvedValue({ data: { suggestions: [] } });
});

function renderDashboardEditor() {
  const { Wrapper } = renderWithProviders(<></>);
  return render(
    <MemoryRouter initialEntries={['/main/dashboards/dash-1/v1/edit']}>
      <Routes>
        <Route
          path="/main/dashboards/:slug/:dashVersion/edit"
          element={<DashboardEditPage />}
        />
      </Routes>
    </MemoryRouter>,
    { wrapper: Wrapper },
  );
}

it('passes variable values to QueryPlotter', async () => {
  const user = userEvent.setup();
  renderDashboardEditor();

  const serviceInput = await screen.findByRole('textbox', {
    name: 'service',
  });
  const initialCalls = DashboardPanelRendererMock.mock.calls.length;
  await user.click(serviceInput);
  await user.type(serviceInput, 'payments');
  await user.keyboard('{Enter}');

  await waitFor(() => {
    const calls = DashboardPanelRendererMock.mock.calls.slice(initialCalls);
    const hasVars = calls.some(
      (call) => call?.[0]?.varsCtx?.service === 'payments',
    );
    expect(hasVars).toBe(true);
  });
});

it('applies time range to QueryPlotter', async () => {
  renderDashboardEditor();
  await waitFor(() => expect(DashboardPanelRendererMock).toHaveBeenCalled());

  await userEvent.click(screen.getByRole('button', { name: 'Pick range' }));

  await waitFor(() => expect(DashboardPanelRendererMock).toHaveBeenCalled());
  const call = DashboardPanelRendererMock.mock.calls.at(-1)?.[0] as any;
  expect(call.startMs).toEqual(333);
  expect(call.endMs).toEqual(444);
});
