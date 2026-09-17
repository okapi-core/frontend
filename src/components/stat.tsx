import { Paper, Stack, Text, useMantineTheme } from '@mantine/core';

type StatVariant = 'normal' | 'green' | 'red';

export function Stat({
  title,
  unit,
  stat,
  boundary = false,
  variant = 'normal',
}: {
  title?: string;
  unit?: string;
  stat?: number | string;
  boundary?: boolean;
  variant?: StatVariant;
}) {
  const theme = useMantineTheme();
  const color =
    variant === 'green'
      ? theme.colors.green[7]
      : variant === 'red'
        ? theme.colors.red[7]
        : theme.colors.gray[8];
  const content = (
    <Stack gap={4}>
      {title ? (
        <Text size="xs" c="gray.6" fw={600}>
          {title}
        </Text>
      ) : null}
      {stat === undefined || stat === null || stat === '' ? (
        <Text size="sm" c="gray.6">
          No data
        </Text>
      ) : (
        <Text fz="xl" fw={700} c={color}>
          {stat}
        </Text>
      )}
      {unit ? (
        <Text size="xs" c="gray.6">
          {unit}
        </Text>
      ) : null}
    </Stack>
  );

  if (boundary) {
    return (
      <Paper withBorder radius="md" p="sm">
        {content}
      </Paper>
    );
  }

  return content;
}
