import { render } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import { RowRenderer } from '../RowRenderer';

const DashboardPanelRendererMock = vi.fn();

vi.mock('../PanelRenderer', () => ({
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

const basePanel = {
  panelId: 'panel-1',
  title: 'Panel 1',
  queryConfig: { queries: [] },
};

const baseRow = {
  rowId: 'row-1',
  title: 'Row',
  panels: [basePanel],
  panelOrder: ['panel-1'],
};

beforeEach(() => {
  vi.clearAllMocks();
});

const { Wrapper } = renderWithProviders(<></>);

it('passes varsCtx to DashboardPanelRenderer', () => {
  render(
    <RowRenderer
      startMs={100}
      endMs={200}
      dashboardId="dash-1"
      row={baseRow as any}
      panels={baseRow.panels as any}
      varsCtx={{ service: 'payments' }}
      onRowTitleUpdate={() => {}}
      onRowDescriptionUpdate={() => {}}
    />,
    { wrapper: Wrapper },
  );

  expect(DashboardPanelRendererMock).toHaveBeenCalled();
  const call = DashboardPanelRendererMock.mock.calls[0][0] as any;
  expect(call.varsCtx).toEqual({ service: 'payments' });
});

it('passes varsCtx to all panels in order', () => {
  const panelA = { ...basePanel, panelId: 'panel-a', title: 'A' };
  const panelB = { ...basePanel, panelId: 'panel-b', title: 'B' };
  const row = {
    ...baseRow,
    panels: [panelA, panelB],
    panelOrder: ['panel-b', 'panel-a'],
  };

  render(
    <RowRenderer
      startMs={100}
      endMs={200}
      dashboardId="dash-1"
      row={row as any}
      panels={row.panels as any}
      varsCtx={{ env: 'prod' }}
      onRowTitleUpdate={() => {}}
      onRowDescriptionUpdate={() => {}}
    />,
    { wrapper: Wrapper },
  );

  expect(DashboardPanelRendererMock).toHaveBeenCalledTimes(2);
  const first = DashboardPanelRendererMock.mock.calls[0][0] as any;
  const second = DashboardPanelRendererMock.mock.calls[1][0] as any;
  expect(first.props.panelId).toEqual('panel-b');
  expect(second.props.panelId).toEqual('panel-a');
  expect(first.varsCtx).toEqual({ env: 'prod' });
  expect(second.varsCtx).toEqual({ env: 'prod' });
});

it('passes empty varsCtx when not provided', () => {
  render(
    <RowRenderer
      startMs={100}
      endMs={200}
      dashboardId="dash-1"
      row={baseRow as any}
      panels={baseRow.panels as any}
      varsCtx={{}}
      onRowTitleUpdate={() => {}}
      onRowDescriptionUpdate={() => {}}
    />,
    { wrapper: Wrapper },
  );

  const call = DashboardPanelRendererMock.mock.calls[0][0] as any;
  expect(call.varsCtx).toEqual({});
});
