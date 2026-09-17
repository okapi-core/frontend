import { Anchor, Group, MantineSize } from '@mantine/core';
import { DbSystemIcon } from '../db-system-icon/db-system-icon';

export function DbSystemName({
  size = 'sm',
  val,
  onClick,
}: {
  size?: MantineSize;
  val: string;
  onClick: ({ v }: { v: string }) => void;
}) {
  const display = val.trim();
  return (
    <Group gap={6} align="center">
      <DbSystemIcon systemName={display} />
      <Anchor
        component="button"
        type="button"
        size={size}
        c="blue.7"
        onClick={() => onClick({ v: val })}
      >
        {display}
      </Anchor>
    </Group>
  );
}
