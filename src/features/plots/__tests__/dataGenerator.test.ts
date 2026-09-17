import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateTimeSeries } from '../dataGenerator';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('generateTimeSeries', () => {
  it('creates named series with evenly spaced samples', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const result = generateTimeSeries({
      from: new Date(0),
      to: new Date(1000),
      samplesPerSecond: 2,
      seriesCount: 2,
    });

    expect(result.map((item) => item.name)).toEqual(['CPU_1', 'CPU_2']);
    expect(result[0].data.map((point) => point.x)).toEqual([0, 500, 1000]);
    expect(result.every((item) => item.data.length === 3)).toBe(true);
  });

  it('guards rate and span and always produces at least two samples', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const result = generateTimeSeries({
      from: 10,
      to: 10,
      samplesPerSecond: -1,
      seriesCount: 1,
    });
    expect(result[0].data).toHaveLength(2);
    expect(result[0].data.map((point) => point.x)).toEqual([10, 11]);
  });

  it('clamps generated values to the supported range', () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(Number.MIN_VALUE)
      .mockReturnValueOnce(0.5)
      .mockReturnValue(0.5);
    const result = generateTimeSeries({
      from: 0,
      to: 1,
      samplesPerSecond: 1,
      seriesCount: 1,
    });
    expect(result[0].data.every((point) => point.y >= 0 && point.y <= 100)).toBe(
      true,
    );
  });

  it('returns no series when seriesCount is zero', () => {
    expect(
      generateTimeSeries({
        from: 0,
        to: 1000,
        samplesPerSecond: 1,
        seriesCount: 0,
      }),
    ).toEqual([]);
  });
});
