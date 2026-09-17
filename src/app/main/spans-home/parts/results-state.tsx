import { Alert } from '@mantine/core';

export function ResultsState({
  error,
  onDismiss,
}: {
  error?: string;
  onDismiss?: () => void;
}) {
  if (error) {
    return (
      <Alert
        title="Query failed"
        color="red"
        variant="light"
        withCloseButton={Boolean(onDismiss)}
        onClose={onDismiss}
      >
        {error}
      </Alert>
    );
  }
  return null;
}
