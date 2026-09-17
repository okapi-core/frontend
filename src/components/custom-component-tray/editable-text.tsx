'use client';

import {
  ActionIcon,
  Button,
  Group,
  Modal,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { Pencil } from 'lucide-react';
import React from 'react';

export type EditableTextProps = {
  value: string | undefined;
  onSave: (next: string) => void;
  label?: string;
  placeholder?: string;
  title?: string; // dialog title
  description?: string; // dialog description
  multiline?: boolean;
  rows?: number;
  className?: string;
  triggerClassName?: string;
  children?: React.ReactNode;
};

export function EditableText({
  value,
  onSave,
  label,
  placeholder,
  title,
  description,
  multiline = false,
  rows = 4,
  className,
  triggerClassName,
  children,
}: EditableTextProps) {
  const [open, setOpen] = React.useState(false);
  const [text, setText] = React.useState(value ?? '');

  React.useEffect(() => {
    if (open) setText(value ?? '');
  }, [open, value]);

  const save = () => {
    onSave(text);
    setOpen(false);
  };

  const displayNode = children ? (
    <div className={className}>{children}</div>
  ) : (
    <Text className={className}>{value || placeholder || 'Edit'}</Text>
  );

  return (
    <Group gap="xs">
      {displayNode}
      <ActionIcon
        variant="subtle"
        aria-label="Edit"
        className={triggerClassName}
        onClick={() => setOpen(true)}
      >
        <Pencil size={16} />
      </ActionIcon>
      <Modal
        opened={open}
        onClose={() => setOpen(false)}
        title={title}
        centered
      >
        <Stack gap="sm">
          {description ? (
            <Text size="sm" c="dimmed">
              {description}
            </Text>
          ) : null}
          {multiline ? (
            <Textarea
              label={label}
              rows={rows}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={placeholder}
            />
          ) : (
            <TextInput
              label={label}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={placeholder}
            />
          )}
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>Save</Button>
          </Group>
        </Stack>
      </Modal>
    </Group>
  );
}

export default EditableText;
