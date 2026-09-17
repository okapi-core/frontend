import { Accordion, Group, Paper, Stack, Text } from '@mantine/core';
import { Sigma } from 'lucide-react';
import { useSpansHomeStore } from '../store';
import { DomainFilterAccordions } from './domain-filter-accordions';
import { FilterSummary } from './filter-summary';
import { ResultsState } from './results-state';
import { SpansStatsQueryExecutor } from './span-stats-query-executor';
import { SpansStatsCfgInput } from './spans-stats-cfg-input';
import { StatsPlotter } from './stats-plotter';
import { TimeFilter } from './time-filter';

export function StatsView() {
  const statsError = useSpansHomeStore((state) => state.statsQueryError);
  const setStatsError = useSpansHomeStore((state) => state.setStatsError);
  return (
    <Stack gap="md">
      <Paper withBorder p="md" radius="md">
        <Stack gap="md">
          <Group gap="xs" align="center">
            <Sigma size={16} />
            <Text fw={600}>Stats view filters</Text>
          </Group>
          <TimeFilter />
          <Accordion multiple>
            <DomainFilterAccordions />
          </Accordion>
        </Stack>
      </Paper>
      <SpansStatsCfgInput />
      <Stack gap="xs" align="flex-start">
        <FilterSummary
          include={[
            'trace',
            'service',
            'database',
            'http',
            'duration',
            'attributes',
          ]}
        />
        <SpansStatsQueryExecutor />
      </Stack>
      <ResultsState
        error={statsError}
        onDismiss={() => setStatsError(undefined)}
      />
      <StatsPlotter />
    </Stack>
  );
}
