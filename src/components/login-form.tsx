'use client';
import { useAppServices } from '@/lib/app-services';
import { signIn } from '@/lib/domain/auth';
import { PendingAction } from '@/lib/types/state-types';
import { cn } from '@/lib/utils';
import {
  Button,
  Card,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { PrivacyNotice } from './privacy-notice';
import { RedirectionNotice } from './redirection-notice';

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <Stack className={cn(className)} gap="lg" {...props}>
      <Card shadow="sm" radius="md" withBorder>
        <Stack gap="xs" align="center">
          <Title order={3}>Welcome back</Title>
          <Text size="sm" c="dimmed">
            Debug faster with Okapi and Oscar.
          </Text>
        </Stack>
        <Stack gap="md" mt="md">
          <EmailPasswordForm />
          <RedirectionNotice
            msg={"Don't have an account"}
            link={'/signup'}
            linkLabel={'Sign up'}
          />
        </Stack>
      </Card>
      <PrivacyNotice />
    </Stack>
  );
}

type EmailPass = {
  email: string;
  password: string;
};

async function handleEmailSubmit({
  values,
  onStart,
  onFail,
  onFinish,
}: {
  values: EmailPass;
  onStart: () => void;
  onFail: (msg: string) => void;
  onFinish: () => void;
}) {
  onStart();
  try {
    await signIn({
      email: values.email,
      password: values.password,
    });
    onFinish();
  } catch (err) {
    onFail(err instanceof Error ? err.message : 'Could not sign in');
  }
}

function EmailPasswordForm() {
  const form = useForm<EmailPass>({
    initialValues: { email: '', password: '' },
    validate: {
      email: (value) =>
        /^\S+@\S+$/.test(value) ? null : 'Please enter a valid email',
      password: (value) =>
        value.length >= 8 ? null : 'Password should be at least 8 chars long.',
    },
    validateInputOnBlur: true,
  });
  const [submitState, setSubmitState] = useState<PendingAction>('initial');
  const { navigation, notify } = useAppServices();
  return (
    <form
      onSubmit={form.onSubmit((val) => {
        handleEmailSubmit({
          values: val,
          onFail: (msg) => {
            notify.error(msg);
            setSubmitState('initial');
          },
          onFinish: () => {
            navigation.navigate('/main/oscar');
          },
          onStart: () => {
            setSubmitState('pending');
          },
        });
      })}
    >
      <Stack gap="sm">
        <TextInput
          label="Email"
          id="email"
          type="email"
          placeholder="m@example.com"
          required
          {...form.getInputProps('email')}
        />
        <PasswordInput
          label="Password"
          id="password"
          required
          {...form.getInputProps('password')}
        />
        <Button type="submit" loading={submitState === 'pending'}>
          Sign in
        </Button>
      </Stack>
    </form>
  );
}
