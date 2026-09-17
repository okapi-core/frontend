import { useAppServices } from '@/lib/app-services';
import { useUserBootstrapApi } from '@/lib/domain/user-bootstrap';
import { Group, Loader, Paper, Text } from '@mantine/core';
import { useEffect, useState, type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';

export default function RootLayout({
  children,
}: Readonly<{
  children?: ReactNode;
}>) {
  const [ready, setReady] = useState<boolean>(false);
  const { loadUserData } = useUserBootstrapApi();
  const { navigation, notify } = useAppServices();

  function routeForSignin() {
    notify.error('Signed out, needs signing in again.');
    navigation.navigate('/login');
  }

  useEffect(() => {
    if (ready) return;
    loadUserData().then((result) => {
      if (result === 'ready') {
        setReady(true);
        return;
      }
      if (result === 'unauthorized') {
        routeForSignin();
        return;
      }
      notify.error('Could not sign in.');
    });
  }, [loadUserData, ready, navigation]);

  if (!ready) {
    return (
      <div style={{ marginTop: '1rem' }}>
        <LoadingMessage />
      </div>
    );
  }
  return <>{children || <Outlet />}</>;
}

function LoadingMessage() {
  return (
    <Paper shadow="xs" radius="md" withBorder p="md" maw={320} mx="auto">
      <Group gap="md" align="center">
        <Loader size="sm" />
        <Text fw={600}>Okapi is loading</Text>
      </Group>
    </Paper>
  );
}
