import { renderWithProviders } from '@/test/utils';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import DashboardEditPage from './page';
import { useDashboardEditStore } from './store';

const getDashboardVersion = vi.fn();
const createRow = vi.fn();
const updateRow = vi.fn();
const deleteRow = vi.fn();
const createPanel = vi.fn();
const listVars = vi.fn();
const RowRendererMock = vi.fn();

vi.mock('@/lib/api', () => ({
  getDashboardVersion: (...args: unknown[]) => getDashboardVersion(...args),
  createRow: (...args: unknown[]) => createRow(...args),
  updateRow: (...args: unknown[]) => updateRow(...args),
  deleteRow: (...args: unknown[]) => deleteRow(...args),
  createPanel: (...args: unknown[]) => createPanel(...args),
  listVars: (...args: unknown[]) => listVars(...args),
  updateDashboard: vi.fn(),
  createVar: vi.fn(),
  deleteVar: vi.fn(),
  getVarHints: vi.fn(),
}));

vi.mock('@/lib/context', () => ({
  useUserData: (selector?: (state: any) => unknown) => {
    const state = {
      currentOrg: { orgId: 'org-1' },
      orgs: { orgs: [] },
    };
    return selector ? selector(state) : state;
  },
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

const DASHBOARD_RESPONSE = {
  dashboardId: 'dash-1',
  title: 'Dashboard',
  description: '',
  rows: [
    {
      rowId: 'row-1',
      title: 'Row',
      panels: [],
      panelOrder: [],
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
  getDashboardVersion.mockResolvedValue({ data: DASHBOARD_RESPONSE });
  listVars.mockResolvedValue({ data: { vars: [] } });
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

it('requests dashboard version with versionId', async () => {
  renderDashboardEditor();
  await waitFor(() => expect(getDashboardVersion).toHaveBeenCalled());
  const call = getDashboardVersion.mock.calls.at(-1)?.[0] as any;
  expect(call.versionId).toEqual('v1');
});

it('includes versionId in row and panel mutations', async () => {
  const user = userEvent.setup();
  renderDashboardEditor();

  await user.click(await screen.findByRole('button', { name: 'Add Row' }));
  await waitFor(() => expect(createRow).toHaveBeenCalled());
  const createCall = createRow.mock.calls.at(-1)?.[0] as any;
  expect(createCall.versionId).toEqual('v1');

  await waitFor(() => expect(RowRendererMock).toHaveBeenCalled());
  const rowProps = RowRendererMock.mock.calls.at(-1)?.[0] as any;

  rowProps.onRowTitleUpdate('New title');
  await waitFor(() => expect(updateRow).toHaveBeenCalled());
  const updateCall = updateRow.mock.calls.at(-1)?.[0] as any;
  expect(updateCall.versionId).toEqual('v1');

  rowProps.onAddPanel();
  await waitFor(() => expect(createPanel).toHaveBeenCalled());
  const panelCall = createPanel.mock.calls.at(-1)?.[0] as any;
  expect(panelCall.versionId).toEqual('v1');

  rowProps.onDeleteRow();
  await waitFor(() => expect(deleteRow).toHaveBeenCalled());
  const deleteCall = deleteRow.mock.calls.at(-1)?.[0] as any;
  expect(deleteCall.versionId).toEqual('v1');
});
