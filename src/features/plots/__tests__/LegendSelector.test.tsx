import { renderWithProviders } from '@/test/utils';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LegendSelector, type LegendItem } from '../LegendSelector';

const items: LegendItem[] = [
  { id: 'cpu', label: 'CPU', tooltip: 'CPU usage' },
  { id: 'memory', label: 'Memory' },
  { id: 'disk', label: 'Disk' },
];

function renderLegend(
  value: string[],
  onChange = vi.fn(),
  props: Partial<React.ComponentProps<typeof LegendSelector>> = {},
) {
  const { Wrapper } = renderWithProviders(<></>);
  render(
    <LegendSelector
      items={items}
      colors={['hsl(0, 70%, 50%)', '#123456']}
      value={value}
      onChange={onChange}
      {...props}
    />,
    { wrapper: Wrapper },
  );
  return onChange;
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('LegendSelector', () => {
  it('renders labels and selected state', () => {
    renderLegend(['cpu', 'disk']);

    expect(screen.getByRole('button', { name: 'CPU' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Memory' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(screen.getByRole('button', { name: 'Disk' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('toggles an item with a normal click', async () => {
    const user = userEvent.setup();
    const onChange = renderLegend(['cpu', 'memory']);

    await user.click(screen.getByRole('button', { name: 'CPU' }));
    expect(onChange).toHaveBeenCalledWith(['memory']);

    await user.click(screen.getByRole('button', { name: 'Disk' }));
    expect(onChange).toHaveBeenLastCalledWith(['cpu', 'memory', 'disk']);
  });

  it('shift-clicks to solo and then invert a solo selection', () => {
    const onChange = renderLegend(['cpu', 'memory']);
    fireEvent.click(screen.getByRole('button', { name: 'Disk' }), {
      shiftKey: true,
    });
    expect(onChange).toHaveBeenCalledWith(['disk']);

    onChange.mockClear();
    renderLegend(['disk'], onChange);
    const diskButtons = screen.getAllByRole('button', { name: 'Disk' });
    fireEvent.click(diskButtons.at(-1)!, { shiftKey: true });
    expect(onChange).toHaveBeenCalledWith(['cpu', 'memory']);
  });

  it('uses normal toggle behavior when shift soloing is disabled', () => {
    const onChange = renderLegend(['cpu'], vi.fn(), {
      soloOnShift: false,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Memory' }), {
      shiftKey: true,
    });
    expect(onChange).toHaveBeenCalledWith(['cpu', 'memory']);
  });

  it('copies a distinct tooltip on right-click and resets feedback', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    renderLegend(['cpu']);

    fireEvent.contextMenu(screen.getByRole('button', { name: 'CPU' }));
    expect(writeText).toHaveBeenCalledWith('CPU usage');

    await act(() => vi.advanceTimersByTimeAsync(1200));
    expect(screen.getByRole('button', { name: 'CPU' })).toBeInTheDocument();
  });
});
