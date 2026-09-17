'use client';

import { useAppServices } from '@/lib/app-services';
import { useAuthApi } from '@/lib/domain/auth';
import {
  Avatar,
  Group,
  Menu,
  Stack,
  Text,
  UnstyledButton,
} from '@mantine/core';
import { BadgeCheck, ChevronsUpDown, LogOut } from 'lucide-react';
import { UserProfile } from './app-sidebar-props';

export function NavUser({ user }: { user: UserProfile }) {
  const { navigation, notify } = useAppServices();
  const authApi = useAuthApi();

  return (
    <Menu width={220} position="bottom-end" withinPortal>
      <Menu.Target>
        <UnstyledButton style={{ width: '100%', padding: 0 }}>
          <Group gap="xs" wrap="nowrap" align="center" p="xs">
            <Avatar radius="sm" size="sm">
              {user.initials}
            </Avatar>
            <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
              <Text fw={600} size="sm">
                {user.name}
              </Text>
              <Text size="xs" c="dimmed" truncate>
                {user.email}
              </Text>
            </Stack>
            <ChevronsUpDown size={16} />
          </Group>
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>
          <Group gap="xs">
            <BadgeCheck size={16} />
            <Text size="sm">Account</Text>
          </Group>
        </Menu.Label>
        <Menu.Item
          leftSection={<BadgeCheck size={16} />}
          onClick={() => {
            navigation.navigate('/main/profile');
          }}
        >
          Profile
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          leftSection={<LogOut size={16} />}
          onClick={async () => {
            notify.message('Signing out');
            try {
              await authApi.signOut();
              notify.success("Sign out successful, you'll be redirected.");
              navigation.navigate('/login');
            } catch {
              notify.error('Could not sign out, please try again later.');
            }
          }}
        >
          Log out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
