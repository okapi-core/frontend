import { submitNotifyEmail } from '@/lib/notify';
import {
  Badge,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import styles from './coming-soon.module.css';

export function ComingSoon({ title, desc }: { title: string; desc: string }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setStatus('loading');
    setError(undefined);
    try {
      await submitNotifyEmail({ email: email.trim() });
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Unable to submit email.');
    }
  };

  return (
    <Paper p="xl" radius="lg" className={styles.card}>
      <Stack gap="lg">
        <Group gap="xs" align="center">
          <Badge size="sm" variant="light" className={styles.badge}>
            Coming Soon
          </Badge>
          <Sparkles size={16} />
        </Group>
        <Stack gap="sm">
          <Text size="xl" fw={700} className={styles.title}>
            {title}
          </Text>
          <Text size="sm" c="gray.7" className={styles.description}>
            {desc}
          </Text>
        </Stack>
        <Group gap="sm" className={styles.formRow} align="flex-end">
          <TextInput
            label="Get early access"
            placeholder="likescoolstuff@internet.com"
            w="100%"
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
            disabled={status === 'loading' || status === 'success'}
          />
          <Button
            onClick={handleSubmit}
            loading={status === 'loading'}
            disabled={!email.trim() || status === 'success'}
          >
            Notify me
          </Button>
        </Group>
        {status === 'success' ? (
          <Text size="xs" c="teal.7">
            You are on the list. We will be in touch.
          </Text>
        ) : null}
        {status === 'error' ? (
          <Text size="xs" c="red.7">
            {error || 'Unable to submit email.'}
          </Text>
        ) : null}
        <Group gap="xs" className={styles.chips}>
          <Badge size="sm" variant="outline" color="gray">
            Early access
          </Badge>
          <Badge size="sm" variant="outline" color="gray">
            Product updates
          </Badge>
          <Badge size="sm" variant="outline" color="gray">
            Private beta
          </Badge>
        </Group>
        <Text size="xs" c="gray.6" className={styles.footnote}>
          We will only email you about this feature. Not big on spamming :)
        </Text>
      </Stack>
    </Paper>
  );
}
