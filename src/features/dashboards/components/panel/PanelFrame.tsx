'use client';
import { PanelDrag } from '@/components/panel-drag/panel-drag';
import { Group, Paper, Text } from '@mantine/core';
import React from 'react';

export function PanelFrame({
  title,
  children,
  rightActions,
}: {
  title?: string;
  children: React.ReactNode;
  rightActions?: React.ReactNode;
}) {
  return (
    <Paper
      withBorder
      radius="md"
      h="100%"
      style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}
    >
      <Group
        h={32}
        px="sm"
        justify="space-between"
        gap="xs"
        style={{
          borderBottom: '1px solid var(--mantine-color-gray-3, #e9ecef)',
        }}
      >
        <Text size="xs" fw={600} truncate>
          {title || 'Panel'}
        </Text>
        <Group gap="xs">
          <PanelDrag />
          {rightActions}
        </Group>
      </Group>
      <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
    </Paper>
  );
}

export default PanelFrame;
