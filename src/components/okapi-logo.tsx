import { Group, Text } from '@mantine/core';
import { GalleryVerticalEnd } from 'lucide-react';

export function OkapiLogo() {
  return (
    <Group gap="xs" align="center" justify="flex-start" px="xs" py="sm">
      <div
        style={{
          background: 'var(--mantine-color-blue-6, #1c7ed6)',
          color: 'white',
          width: 28,
          height: 28,
          display: 'grid',
          placeItems: 'center',
          borderRadius: 8,
        }}
        aria-hidden
      >
        <GalleryVerticalEnd size={16} />
      </div>
      <Text fw={700} size="sm" lh={1}>
        Okapi
      </Text>
    </Group>
  );
}
