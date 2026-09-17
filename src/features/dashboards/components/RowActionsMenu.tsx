'use client';

import { ActionIcon, Menu } from '@mantine/core';
import { EllipsisVertical } from 'lucide-react';

export type RowActionsMenuProps = {
  onAddPanel?: () => void;
  onDelete?: () => void;
};

export function RowActionsMenu({ onAddPanel, onDelete }: RowActionsMenuProps) {
  return (
    <Menu withinPortal position="bottom-end">
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray" aria-label="Row actions">
          <EllipsisVertical size={16} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          onClick={() => {
            onAddPanel?.();
          }}
        >
          Add Panel
        </Menu.Item>
        <Menu.Item
          color="red"
          onClick={() => {
            onDelete?.();
          }}
        >
          Delete
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

export default RowActionsMenu;
