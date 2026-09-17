import { SideDrawer } from '@/components/side-drawer/side-drawer';
import { SpanRowV2 } from '@/lib/response-types';
import { Accordion, Stack, Text } from '@mantine/core';
import { CustomAttributesView } from './custom-attributes-view';
import { DbAttributesView } from './db-attributes-view';
import { HttpAttribsView } from './http-attribs-view';
import { RpcAttributesView } from './rpc-attributes-view';
import { ServiceAttributesView } from './service-attributes-view';
import { TraceView } from './trace-view';

export function SpanAttributesSideView({
  row,
  open,
  onClose,
}: {
  row?: SpanRowV2;
  open: boolean;
  onClose: () => void;
}) {
  // layout all attributes horizontally
  return (
    <SideDrawer
      open={open}
      onClose={onClose}
      size="md"
      title={
        <Text fw={600} size="md">
          Span details
        </Text>
      }
    >
      {!row && <Text c={'gray.8'}>Nothing to show</Text>}
      {row && (
        <Stack p={'md'} mt={'lg'}>
          <Accordion
            multiple
            variant="contained"
            chevronPosition="left"
            radius="sm"
            defaultValue={['trace', 'service', 'http', 'db', 'rpc', 'custom']}
          >
            <Accordion.Item value="trace">
              <Accordion.Control>Trace</Accordion.Control>
              <Accordion.Panel>
                <TraceView row={row} />
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="service">
              <Accordion.Control>Service</Accordion.Control>
              <Accordion.Panel>
                <ServiceAttributesView row={row} />
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="http">
              <Accordion.Control>HTTP</Accordion.Control>
              <Accordion.Panel>
                <HttpAttribsView row={row} />
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="db">
              <Accordion.Control>DB</Accordion.Control>
              <Accordion.Panel>
                <DbAttributesView row={row} />
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="rpc">
              <Accordion.Control>RPC</Accordion.Control>
              <Accordion.Panel>
                <RpcAttributesView row={row} />
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="custom">
              <Accordion.Control>Custom</Accordion.Control>
              <Accordion.Panel>
                <CustomAttributesView row={row} />
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Stack>
      )}
    </SideDrawer>
  );
}
