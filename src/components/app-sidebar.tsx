'use client';

import { Divider, Group, Loader, ScrollArea, Stack } from '@mantine/core';
import {
  Activity,
  Bot,
  LayoutDashboard,
  ListTree,
  Network,
  User,
} from 'lucide-react';

import { NavUser } from '@/components/nav-user';
import { useProfileApi } from '@/lib/domain/profile';
import { AppSidebarProps, SideBarItemProps } from './app-sidebar-props';
import { FallbackContainer } from './fallback-container';
import { NavMain } from './nav-main';
import { OkapiLogo } from './okapi-logo';

export const AllApps: SideBarItemProps[] = [
  {
    itemId: 'oscar',
    title: 'Ask Oscar',
    url: '/main/oscar',
    icon: Bot,
  },
  {
    itemId: 'playground',
    title: 'Dashboards',
    url: '/main/dashboards',
    icon: LayoutDashboard,
  },
  {
    itemId: 'spans',
    title: 'Spans',
    url: '/main/spans',
    icon: Network,
  },
  {
    itemId: 'logs',
    title: 'Logs',
    url: '/main/logs',
    icon: ListTree,
  },
  {
    itemId: 'svc-health',
    title: 'Service health',
    url: '/main/svc-health',
    icon: Activity,
  },
  {
    itemId: 'profile',
    title: 'Profile',
    url: '/main/profile',
    icon: User,
  },
];

export function AppSidebar({ org, activeItem, onNavigate }: AppSidebarProps) {
  return (
    <Stack gap="sm" h="100%">
      <OkapiLogo />
      <Divider />
      <ScrollArea style={{ flex: 1 }}>
        <NavMain
          items={AllApps}
          activeItem={activeItem}
          onNavigate={onNavigate}
        />
      </ScrollArea>
      <Divider />
      <div>
        <UserProfileFooter />
      </div>
    </Stack>
  );
}

function UserProfileFooter() {
  const { profileQuery: loadProfileQuery } = useProfileApi();
  return (
    <FallbackContainer
      loading={loadProfileQuery.isLoading}
      fallback={
        <Group justify="center">
          <Loader size="sm" />
        </Group>
      }
    >
      <NavUser
        user={{
          name: loadProfileQuery.data?.data?.firstName || '',
          email: loadProfileQuery.data?.data?.email || '',
          initials: getInitials(
            loadProfileQuery.data?.data?.firstName,
            loadProfileQuery.data?.data?.lastName,
          ),
        }}
      />
    </FallbackContainer>
  );
}

export function getInitials(
  first: string | undefined,
  second: string | undefined,
) {
  const f = first?.[0] || 'A';
  const s = second?.[0] || 'B';
  return f + s;
}
