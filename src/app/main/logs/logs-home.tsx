'use client';
import TimeRangePicker from '@/components/custom-component-tray/time-range-picker';
import { PageCanvas } from '@/components/page-canvas';
import { useUserData } from '@/lib/context';
import { useLogsAutocomplete } from '@/lib/domain/logs';
import { Stack } from '@mantine/core';
import { LogFilters } from './log-filters';
import { LogsResults } from './logs-results';
import { useFetchLogs, useLogsHomeStore, useSetTimeRange } from './store';

export default function LogsHome() {
  const { currentOrg } = useUserData();
  return (
    <PageCanvas
      path={[{ label: 'Browse logs', href: '/main/logs' }]}
      inner={<Inner />}
      sidebarProps={{
        org: currentOrg,
        activeItem: 'logs',
      }}
    />
  );
}

function Inner() {
  const timeRange = useLogsHomeStore((state) => state.timeRange);
  const setTimeRange = useSetTimeRange();
  const autocomplete = useLogsAutocomplete({ timeRange });
  const { processQuery } = useFetchLogs();

  return (
    <Stack gap="md">
      <TimeRangePicker value={timeRange} onChange={setTimeRange} />
      <LogFilters
        onSubmit={(f) => processQuery({ filters: f })}
        getAttributeSuggestions={autocomplete.getAttributeSuggestions}
        getValueSuggestions={autocomplete.getValueSuggestions}
      />
      <LogsResults />
    </Stack>
  );
}
