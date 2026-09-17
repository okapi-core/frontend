import { ChartWithLegend } from '@/features/plots/ChartWithLegend';
import { Paper, Stack, Text } from '@mantine/core';
import { useMemo } from 'react';
import { useSpansHomeStore } from '../store';

export function StatsPlotter() {
  const spanStats = useSpansHomeStore((state) => state.spanStats);
  const numericSeries = spanStats?.numericSeries || [];

  const series = useMemo(() => {
    return numericSeries
      .map((entry) => ({
        name: entry.attribute || 'unknown',
        data: (entry.points || [])
          .map((point) => ({
            x: point.bucketStartMs ?? 0,
            y: point.value ?? 0,
          }))
          .filter(
            (point) => Number.isFinite(point.x) && Number.isFinite(point.y),
          ),
      }))
      .filter((entry) => entry.data.length > 0);
  }, [numericSeries]);

  if (!spanStats) {
    return (
      <Paper withBorder p="md" radius="md">
        <Text size="sm" c="dimmed">
          Run a stats query to see the distribution plot.
        </Text>
      </Paper>
    );
  }

  if (!series.length) {
    return (
      <Paper withBorder p="md" radius="md">
        <Text size="sm" c="dimmed">
          No distribution data returned for the selected attributes.
        </Text>
      </Paper>
    );
  }
  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="xs">
        <Text fw={600} size="sm">
          Distribution
        </Text>
        <ChartWithLegend series={series} yAxisLabel="value" height={280} />
      </Stack>
    </Paper>
  );
}
