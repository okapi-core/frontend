'use client';

import { useAppServices } from '@/lib/app-services';
import { NavLink, Stack } from '@mantine/core';
import { SideBarItemProps } from './app-sidebar-props';

export function NavMain({
  activeItem,
  items,
  onNavigate,
}: {
  activeItem: string;
  items: SideBarItemProps[];
  onNavigate?: () => void;
}) {
  const { navigation } = useAppServices();
  return (
    <Stack gap={4}>
      {items.map((item) => (
        <NavLink
          key={item.itemId}
          label={item.title}
          leftSection={item.icon ? <item.icon size={16} /> : undefined}
          active={item.itemId === activeItem}
          onClick={() => {
            navigation.navigate(item.url);
            onNavigate?.();
          }}
          variant="light"
        />
      ))}
    </Stack>
  );
}
