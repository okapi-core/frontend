import { Anchor, Center, Group, Stack, Text } from '@mantine/core';
import { GalleryVerticalEnd } from 'lucide-react';

import { SignupForm } from '@/components/signup-form';

export default function SignupPage() {
  return (
    <Center
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at 20% 20%, rgba(76,110,245,0.06), transparent 35%), radial-gradient(circle at 80% 0%, rgba(34,197,94,0.05), transparent 30%), #f6f8fb',
      }}
      px="lg"
      py="xl"
    >
      <Stack gap="lg" w="100%" maw={520}>
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
        <SignupForm />
      </Stack>
    </Center>
  );
}
