import { Stat } from '@/components/stat';
import { Badge, Group, SimpleGrid, Stack } from '@mantine/core';

export function GoldenAggregateMini({
  totalRequests,
  totalErrors,
  rps,
  rpm,
  errorRate,
  availability,
  noRequests,
  bestEffort,
}: {
  totalRequests?: number;
  totalErrors?: number;
  rps?: number;
  rpm?: number;
  errorRate?: number;
  availability?: number;
  noRequests?: boolean;
  bestEffort?: boolean;
}) {
  const errorRatePct =
    errorRate !== undefined ? (errorRate * 100).toFixed(2) : undefined;
  const availabilityPct =
    availability !== undefined ? (availability * 100).toFixed(2) : undefined;
  return (
    <Stack gap="xs">
      {bestEffort ? (
        <Group>
          <Badge color="yellow" variant="light">
            Best effort
          </Badge>
        </Group>
      ) : null}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 6 }} spacing="xs">
        <Stat title="Total requests" stat={totalRequests} boundary />
        <Stat
          title="Total errors"
          stat={totalErrors}
          variant={totalErrors && totalErrors > 0 ? 'red' : 'normal'}
          boundary
        />
        <Stat
          title="Availability"
          unit={noRequests ? undefined : '%'}
          stat={noRequests ? 'No requests' : availabilityPct}
          variant={
            availability !== undefined && availability < 1 ? 'red' : 'normal'
          }
          boundary
        />
        <Stat
          title="Error rate"
          unit="%"
          stat={errorRatePct}
          variant={errorRate !== undefined && errorRate > 0 ? 'red' : 'normal'}
          boundary
        />
        <Stat
          title="RPS"
          stat={rps !== undefined ? rps.toFixed(2) : undefined}
          boundary
        />
        <Stat
          title="RPM"
          stat={rpm !== undefined ? rpm.toFixed(2) : undefined}
          boundary
        />
      </SimpleGrid>
    </Stack>
  );
}
