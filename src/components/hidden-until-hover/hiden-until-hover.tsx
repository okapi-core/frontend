import { Group } from '@mantine/core';
import { ReactNode, useState } from 'react';

export function HiddenUntilHover({
  main,
  hidden,
}: {
  main: ReactNode;
  hidden: ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  const opacity = hovered ? 100 : 0;
  return (
    <Group
      //   style={{ display: 'flex', flexDirection: 'row', columnGap: '1px',  }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {main}
      <div style={{ opacity }}>{hidden}</div>
    </Group>
  );
}
