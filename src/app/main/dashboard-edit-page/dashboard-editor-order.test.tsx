import { renderWithProviders } from '@/test/utils';
import { render, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import DashboardEditPage from './page';
import { useDashboardEditStore } from './store';

const getDashboardVersion = vi.fn();
const listVars = vi.fn();
const RowRendererMock = vi.fn();

vi.mock('@/lib/api', () => ({
  getDashboardVersion: (...args: unknown[]) => getDashboardVersion(...args),
  listVars: (...args: unknown[]) => listVars(...args),
  createRow: vi.fn(),
  updateRow: vi.fn(),
  deleteRow: vi.fn(),
  createPanel: vi.fn(),
  updateDashboard: vi.fn(),
  createVar: vi.fn(),
  deleteVar: vi.fn(),
  getVarHints: vi.fn(),
}));

vi.mock('@/lib/context', () => ({
  useUserData: () => ({
    currentOrg: { orgId: 'org-1' },
    orgs: { orgs: [] },
  }),
}));

vi.mock('@/features/dashboards/components/RowRenderer', () => ({
  RowRenderer: (props: unknown) => {
    RowRendererMock(props);
    return <div data-testid="row-renderer" />;
  },
}));

vi.mock('@/components/page-canvas', () => ({
  PageCanvas: ({ inner }: { inner: React.ReactNode }) => <div>{inner}</div>,
}));

beforeEach(() => {
  vi.clearAllMocks();
  useDashboardEditStore.setState({
    timeRange: { startMs: 0, endMs: 0 },
    varsCtx: {},
    manageVarsOpen: false,
  });
  listVars.mockResolvedValue({ data: { vars: [] } });
  getDashboardVersion.mockResolvedValue({
    data: {
      dashboardId: 'dash-1',
      rows: [
        { rowId: 'row-a', title: 'A', panels: [], panelOrder: [] },
        { rowId: 'row-b', title: 'B', panels: [], panelOrder: [] },
      ],
      rowOrder: ['row-b', 'row-a'],
    },
  });
});

it('renders rows in rowOrder order', async () => {
  const { Wrapper } = renderWithProviders(<></>);
  render(
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

  await waitFor(() => expect(RowRendererMock).toHaveBeenCalledTimes(2));
  const first = RowRendererMock.mock.calls[0][0] as any;
  const second = RowRendererMock.mock.calls[1][0] as any;
  expect(first.row.rowId).toEqual('row-b');
  expect(second.row.rowId).toEqual('row-a');
});
