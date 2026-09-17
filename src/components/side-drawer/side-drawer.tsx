import {
  Button,
  Group,
  Paper,
  Transition,
  useMantineTheme,
} from '@mantine/core';
import { XIcon } from 'lucide-react';
import React from 'react';

export function SideDrawer({
  open,
  onClose,
  children,
  h,
  w,
  title,
  size,
}: {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  h?: string;
  w?: string;
  title?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) {
  const width = w || (size === 'sm' ? '10vw' : size === 'md' ? '25vw' : '50vw');
  const theme = useMantineTheme();
  const shadow = theme.colors['gray'][4];
  const boxShadow = `0px 2px 8px ${shadow}`;
  return (
    <Transition
      mounted={open}
      transition="fade-left"
      duration={200}
      timingFunction="ease"
    >
      {(styles) => (
        <Paper
          style={{
            ...styles,
            position: 'fixed',
            top: '0',
            right: '0',
            width,
            height: h || '100vh',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            background: 'white',
            zIndex: 100,
            overflow: 'hidden',
            boxShadow,
          }}
        >
          <Group gap="xs" align="center" mt={'lg'}>
            <Button size="xs" variant="white" onClick={onClose}>
              <XIcon />
            </Button>
            <div>{title}</div>
          </Group>
          <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            {children}
          </div>
        </Paper>
      )}
    </Transition>
  );
}
