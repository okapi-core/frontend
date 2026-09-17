'use client';

import { Button, Group, Stack, Text, Title } from '@mantine/core';

type DeletionPromptProps = {
  onDeleteConfirmed: () => void | Promise<void>;
  onCancel?: () => void;
};

// Content-only dialog prompt to confirm deletion. Parent controls Dialog state.
export function DeletionPrompt({
  onDeleteConfirmed,
  onCancel,
}: DeletionPromptProps) {
  return (
    <Stack gap="md">
      <div>
        <Title order={5}>Delete dashboard?</Title>
        <Text size="sm" c="dimmed" mt={4}>
          This action cannot be undone. This will permanently delete the
          dashboard and its configuration.
        </Text>
      </div>
      <Group justify="flex-end">
        <Button variant="default" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          color="red"
          onClick={() => {
            void onDeleteConfirmed();
          }}
        >
          Delete
        </Button>
      </Group>
    </Stack>
  );
}

export default DeletionPrompt;
