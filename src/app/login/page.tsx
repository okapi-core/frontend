import { Anchor, Center, Group, Stack, Text } from '@mantine/core';
import { GalleryVerticalEnd } from 'lucide-react';

import { LoginForm } from '@/components/login-form';

export default function LoginPage() {
  return (
    <Center w="100%" pt="lg">
      <Stack gap="lg" w="100%" maw={640}>
        <Anchor href="#" underline="never" c="inherit">
          <Group gap="xs" justify="center" style={{ fontWeight: 600 }}>
            <div
              style={{
                background: 'var(--mantine-color-blue-6, #1c7ed6)',
                color: 'white',
                width: 26,
                height: 26,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 6,
              }}
            >
              <GalleryVerticalEnd size={16} />
            </div>
            <Text fw={700}>Okapi</Text>
          </Group>
        </Anchor>
        <LoginForm />
      </Stack>
    </Center>
  );
}
