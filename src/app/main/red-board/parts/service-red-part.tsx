import { GoldenAggregateMini } from '@/components/golden-aggregate-mini';
import { RedsPanel } from '@/components/reds-panel/reds-panel';
import { ServiceLabel } from '@/components/service-label';
import { Group, Stack, Text } from '@mantine/core';
import { deriveGoldenAggregates, normalizeMetrics } from '../lib';
import { useRedBoardStore } from '../store';

const PANEL_HEIGHT = 220;

export function ServiceRedPart() {
  const serviceName = useRedBoardStore((state) => state.serviceRed?.service);
  const metrics = useRedBoardStore((state) => state.serviceRed?.serviceRed);
  if (!serviceName || !metrics) return null;

  const aggregates = deriveGoldenAggregates(metrics);

  return (
    <Stack gap="sm">
      <Group gap="xs" align="center">
        <Text fw={600}>Service overview for </Text>
        <ServiceLabel svc={serviceName} />
      </Group>
      <GoldenAggregateMini {...aggregates} />
      <RedsPanel
        operation={serviceName}
        redMetrics={normalizeMetrics(metrics)}
        h={PANEL_HEIGHT}
        w="100%"
      />
    </Stack>
  );
}
