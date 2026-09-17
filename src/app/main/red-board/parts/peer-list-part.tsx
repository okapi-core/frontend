import { ServiceLabel } from '@/components/service-label';
import { Group, Stack, Text } from '@mantine/core';
import { useRedBoardStore } from '../store';

export function PeerListPart() {
  const svcList = useRedBoardStore((state) => state.serviceRed?.peerReds);
  const setPeer = useRedBoardStore((state) => state.setPeer);
  const listPeers = (svcList || []).map((edge) => edge.peerService);
  return (
    <Stack gap="xs">
      <Group gap="xs" align="center">
        <Text fw={600}>Peers</Text>
      </Group>
      {listPeers.length === 0 && (
        <Text c={'gray.7'} size="sm">
          No peers for this service
        </Text>
      )}
      <Group gap="xs">
        {listPeers.map((peerName) => {
          return (
            <ServiceLabel
              size="sm"
              key={peerName}
              svc={peerName}
              onClick={(svc) => {
                setPeer(svc);
              }}
            />
          );
        })}
      </Group>
    </Stack>
  );
}
