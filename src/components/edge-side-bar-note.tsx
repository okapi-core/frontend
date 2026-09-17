import { ServiceLabel } from '@/components/service-label';
import { Text } from '@mantine/core';

export function EdgeSideBarNote({
  caller,
  callee,
  resolution,
}: {
  caller: string;
  callee: string;
  resolution: string;
}) {
  return (
    <Text size="sm" c="gray.6">
      Requests from <ServiceLabel svc={caller} /> to{' '}
      <ServiceLabel svc={callee} />. Values calculated at {resolution}{' '}
      resolution.
    </Text>
  );
}
