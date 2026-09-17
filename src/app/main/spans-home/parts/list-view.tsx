import { SmallBoldAccordionControl } from '@/components/small-bold-accordion-control/small-bold-accordion-control';
import { Accordion, Group, Paper, Stack, Text } from '@mantine/core';
import { List } from 'lucide-react';
import { useSpansHomeStore } from '../store';
import { AttributeFilters } from './attribute-filters';
import { DomainFilterAccordions } from './domain-filter-accordions';
import { FilterSummary } from './filter-summary';
import { ListResultsTable } from './list-results-table';
import { ListSpansQueryExecutor } from './list-spans-query-executor';
import { ResultsState } from './results-state';
import { SpanAttribsView } from './span-attribs-view';
import { TimeFilter } from './time-filter';

export function ListView() {
  const listItems = useSpansHomeStore((state) => state.listItems);
  const listError = useSpansHomeStore((state) => state.listError);
  const setListError = useSpansHomeStore((state) => state.setListError);

  return (
    <>
      <Stack gap="md">
        <Paper withBorder p="md" radius="md">
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Group gap="xs" align="center">
                <List size={16} />
                <Text fw={600}>Search spans</Text>
              </Group>
            </Group>
            <TimeFilter />
            <Accordion multiple>
              <DomainFilterAccordions />
              <Accordion.Item value="attributes">
                <SmallBoldAccordionControl title="Attribute filters" />
                <Accordion.Panel>
                  <AttributeFilters />
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
            <Stack gap="xs" align="flex-start">
              <FilterSummary />
              <ListSpansQueryExecutor />
            </Stack>
          </Stack>
        </Paper>
        <ResultsState
          error={listError}
          onDismiss={() => setListError(undefined)}
        />
      </Stack>
      <ListResultsTable items={listItems} />
      <SpanAttribsView />
    </>
  );
}
