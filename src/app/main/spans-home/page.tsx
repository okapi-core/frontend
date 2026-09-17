import { PageCanvas } from '@/components/page-canvas';
import { useUserData } from '@/lib/context';
import { Badge, Group, Stack, Title } from '@mantine/core';
import { ListView } from './parts/list-view';
import { StatsView } from './parts/stats-view';
import { ViewSwitch } from './parts/view-switch';
import {
  useSpanUrlState,
  useSyncSpanUrlStateToStore,
} from './use-span-url-state';

export default function SpansHome() {
  const { currentOrg } = useUserData();
  return (
    <PageCanvas
      path={[{ label: 'Browse spans', href: '/main/spans' }]}
      inner={<Inner />}
      sidebarProps={{
        org: currentOrg,
        activeItem: 'spans',
      }}
    />
  );
}

function Inner() {
  useSyncSpanUrlStateToStore();
  const { view } = useSpanUrlState();

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Group gap="xs" align="baseline">
          <Title order={4}>Spans</Title>
          <Badge variant="light" size="sm">
            Query
          </Badge>
        </Group>
        <ViewSwitch />
      </Group>

      {view === 'list' && <ListView />}
      {view === 'stats' && <StatsView />}
    </Stack>
  );
}
