import { SmallBoldAccordionControl } from '@/components/small-bold-accordion-control/small-bold-accordion-control';
import { Accordion, Group } from '@mantine/core';
import { DbFilter } from './db-filter';
import { DurationFilter } from './duration-filter';
import { HttpFilter } from './http-filter';
import { ServiceFilter } from './service-filter';
import { SpanIdFilter } from './span-id-filter';
import { SpanKindFilter } from './span-kind-filter';
import { TraceIdFilter } from './trace-id-filter';

export function DomainFilterAccordions() {
  return (
    <>
      <Accordion.Item value="trace">
        <SmallBoldAccordionControl title="Trace & span filters" />
        <Accordion.Panel>
          <Group align="flex-end" wrap="wrap">
            <TraceIdFilter />
            <SpanIdFilter />
            <SpanKindFilter />
          </Group>
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="duration">
        <SmallBoldAccordionControl title="Duration filters" />
        <Accordion.Panel>
          <DurationFilter />
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="service">
        <SmallBoldAccordionControl title="Service filters" />
        <Accordion.Panel>
          <ServiceFilter />
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="database">
        <SmallBoldAccordionControl title="Database filters" />
        <Accordion.Panel>
          <DbFilter />
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="http">
        <SmallBoldAccordionControl title="Http filters" />
        <Accordion.Panel>
          <HttpFilter />
        </Accordion.Panel>
      </Accordion.Item>
    </>
  );
}
