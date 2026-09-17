import { act, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FlameGraph } from '../FlameGraph';

const mocks = vi.hoisted(() => {
  const graph: any = vi.fn();
  graph.height = vi.fn(() => graph);
  graph.cellHeight = vi.fn(() => graph);
  graph.transitionDuration = vi.fn(() => graph);
  graph.width = vi.fn(() => graph);

  const selection = {
    datum: vi.fn(),
    call: vi.fn(),
  };
  selection.datum.mockReturnValue(selection);
  selection.call.mockReturnValue(selection);

  return {
    graph,
    flamegraph: vi.fn(() => graph),
    select: vi.fn(() => selection),
    selection,
  };
});

vi.mock('d3', () => ({ select: mocks.select }));
vi.mock('d3-flame-graph', () => ({ flamegraph: mocks.flamegraph }));

let resizeCallback: ResizeObserverCallback;
const observe = vi.fn();
const disconnect = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  mocks.graph.height.mockReturnValue(mocks.graph);
  mocks.graph.cellHeight.mockReturnValue(mocks.graph);
  mocks.graph.transitionDuration.mockReturnValue(mocks.graph);
  mocks.graph.width.mockReturnValue(mocks.graph);
  mocks.flamegraph.mockReturnValue(mocks.graph);
  mocks.selection.datum.mockReturnValue(mocks.selection);
  mocks.selection.call.mockReturnValue(mocks.selection);

  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: ResizeObserverCallback) {
        resizeCallback = callback;
      }
      observe = observe;
      disconnect = disconnect;
    },
  );
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    width: 0,
    height: 100,
    top: 0,
    left: 0,
    right: 0,
    bottom: 100,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
});

describe('FlameGraph', () => {
  it('configures and renders the graph with fallback width', () => {
    const data = { name: 'root', value: 1 } as any;
    const { container } = render(<FlameGraph data={data} height={300} />);
    const element = container.firstElementChild;

    expect(mocks.graph.height).toHaveBeenCalledWith(300);
    expect(mocks.graph.cellHeight).toHaveBeenCalledWith(18);
    expect(mocks.graph.transitionDuration).toHaveBeenCalledWith(200);
    expect(mocks.graph.width).toHaveBeenCalledWith(960);
    expect(mocks.select).toHaveBeenCalledWith(element);
    expect(mocks.selection.datum).toHaveBeenCalledWith(data);
    expect(mocks.selection.call).toHaveBeenCalledWith(mocks.graph);
  });

  it('rerenders at the observed width and disconnects on unmount', () => {
    const rectSpy = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue({
        width: 640,
        height: 100,
        top: 0,
        left: 0,
        right: 640,
        bottom: 100,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });
    const { unmount } = render(
      <FlameGraph data={{ name: 'root', value: 1 } as any} />,
    );

    act(() => resizeCallback([], {} as ResizeObserver));
    expect(mocks.graph.width).toHaveBeenCalledWith(640);
    expect(observe).toHaveBeenCalled();

    unmount();
    expect(disconnect).toHaveBeenCalled();
    rectSpy.mockRestore();
  });

  it('does not invoke D3 without data', () => {
    render(<FlameGraph />);
    expect(mocks.select).not.toHaveBeenCalled();
  });
});
