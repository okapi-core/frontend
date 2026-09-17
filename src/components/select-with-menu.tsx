import { Button, Menu } from '@mantine/core';
import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';

type SelectWithMenuOption = {
  value: string;
  label: string;
};

export function SelectWithMenu({
  label,
  value,
  placeholder = 'Select',
  options,
  onChange,
  allowUnset = false,
  unsetLabel = 'Unset',
  size = 'xs',
  disabled = false,
  menuWidth = 'auto',
  buttonVariant = 'default',
}: {
  label?: ReactNode;
  value?: string;
  placeholder?: ReactNode;
  options: SelectWithMenuOption[];
  onChange: (value?: string) => void;
  allowUnset?: boolean;
  unsetLabel?: string;
  size?: 'xs' | 'sm' | 'md';
  disabled?: boolean;
  menuWidth?: number | 'auto';
  buttonVariant?: 'default' | 'light' | 'subtle';
}) {
  const activeLabel = options.find((option) => option.value === value)?.label;
  const buttonText = activeLabel || label || placeholder;
  const resolvedMenuWidth = menuWidth === 'auto' ? undefined : menuWidth;

  return (
    <Menu shadow="md" width={resolvedMenuWidth}>
      <Menu.Target>
        <Button
          size={size}
          variant={buttonVariant}
          disabled={disabled}
          rightSection={<ChevronDown size={14} />}
        >
          {buttonText}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        {options.map((option) => (
          <Menu.Item key={option.value} onClick={() => onChange(option.value)}>
            {option.label}
          </Menu.Item>
        ))}
        {allowUnset ? (
          <>
            <Menu.Divider />
            <Menu.Item color="red" onClick={() => onChange(undefined)}>
              {unsetLabel}
            </Menu.Item>
          </>
        ) : null}
      </Menu.Dropdown>
    </Menu>
  );
}
