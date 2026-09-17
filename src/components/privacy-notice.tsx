import { Anchor, Text } from '@mantine/core';

export function PrivacyNotice() {
  return (
    <Text size="sm" ta="center" px="md" c="dimmed">
      By clicking continue, you agree to our{' '}
      <Anchor href="#">Terms of Service</Anchor> and{' '}
      <Anchor href="#">Privacy Policy</Anchor>.
    </Text>
  );
}
