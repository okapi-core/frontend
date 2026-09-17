'use client';
import { ActionIcon, Collapse, Group, Paper, Stack } from '@mantine/core';
import { ChevronDown } from 'lucide-react';
import React from 'react';

export function RowLayout({
  open,
  onToggle,
  title,
  actions,
  description,
  children,
}: {
  open: boolean;
  onToggle: () => void;
  title: React.ReactNode;
  actions?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Paper
      withBorder={false}
      radius="md"
      mt="sm"
      style={{ borderTop: '1px solid var(--mantine-color-gray-3, #e9ecef)' }}
    >
      <Group px="sm" py="xs" gap="xs" align="center">
        <ActionIcon
          variant="subtle"
          aria-label="Toggle row"
          onClick={onToggle}
          style={{
            transform: `rotate(${open ? 0 : -90}deg)`,
            transition: 'transform 150ms ease',
          }}
        >
          <ChevronDown size={16} />
        </ActionIcon>
        <div style={{ flex: 1, minWidth: 0 }}>{title}</div>
        {actions}
      </Group>
      <Collapse in={open}>
        <Stack px="sm" pb="sm" gap="xs">
          {description}
          {children}
        </Stack>
      </Collapse>
    </Paper>
  );
}
