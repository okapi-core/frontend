import {
  Anchor,
  AppShell,
  Breadcrumbs,
  Group,
  Paper,
  Stack,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Home } from 'lucide-react';
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AppSidebar } from './app-sidebar';
import { AppSidebarProps } from './app-sidebar-props';

export function PageCanvas({
  path,
  inner,
  sidebarProps,
}: {
  path: { label: string; href: string }[];
  sidebarProps: AppSidebarProps;
  inner: ReactNode | ReactNode[];
}) {
  const [opened, { toggle, close }] = useDisclosure();
  return (
    <AppShell
      padding="md"
      navbar={{
        width: 260,
        breakpoint: 'sm',
        collapsed: { mobile: !opened, desktop: false },
      }}
    >
      <AppShell.Navbar p="md">
        <AppSidebar {...sidebarProps} onNavigate={close} />
      </AppShell.Navbar>
      <AppShell.Main>
        <Stack gap="md">
          <Paper withBorder shadow="xs" radius="md" p="md">
            <Stack gap="md">
              <BreadCrumb path={path} />
              {inner}
            </Stack>
          </Paper>
        </Stack>
      </AppShell.Main>
    </AppShell>
  );
}

function BreadCrumb({ path }: { path: { label: string; href: string }[] }) {
  const fullPath: { label: string; href: string; icon?: ReactNode }[] = [
    { label: '', href: '/main/dashboards', icon: <Home size={14} /> },
    ...path,
  ];
  const items = fullPath.map((p, idx) => (
    <Anchor
      key={`${p.href}-${idx}`}
      component={Link}
      to={p.href}
      c="dimmed"
      underline="never"
      fw={500}
      size="sm"
    >
      <Group gap={6} align="center" wrap="nowrap">
        {p.icon}
        {p.label && <span>{p.label}</span>}
      </Group>
    </Anchor>
  ));
  return (
    <Breadcrumbs
      color="gray.8"
      separator={
        <span style={{ color: 'var(--mantine-color-gray-5)' }}>/</span>
      }
    >
      {items}
    </Breadcrumbs>
  );
}
