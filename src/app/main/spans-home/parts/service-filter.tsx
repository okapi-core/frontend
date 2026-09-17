import { SERVICE_NAME, SERVICE_PEER_NAME } from '@/lib/span-attributes';
import { Group } from '@mantine/core';
import { useSpansHomeStore } from '../store';
import { SpanStringAttributePicker } from './span-string-attribute-picker';

export function ServiceFilter() {
  const serviceName = useSpansHomeStore((state) => state.serviceName);
  const servicePeer = useSpansHomeStore((state) => state.servicePeer);
  const setServiceName = useSpansHomeStore((state) => state.setServiceName);
  const setServicePeer = useSpansHomeStore((state) => state.setServicePeer);

  return (
    <Group align="flex-end" wrap="wrap">
      <SpanStringAttributePicker
        label="Service"
        placeholder="orders-api"
        value={serviceName}
        attrib={SERVICE_NAME}
        onChange={setServiceName}
      />
      <SpanStringAttributePicker
        label="Peer service"
        placeholder="payments-api"
        value={servicePeer}
        attrib={SERVICE_PEER_NAME}
        onChange={setServicePeer}
      />
    </Group>
  );
}
