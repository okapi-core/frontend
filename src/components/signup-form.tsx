'use client';
import { signUp } from '@/lib/domain/auth';
import { useAppServices } from '@/lib/app-services';
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

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <Stack className={cn(className)} gap="lg" {...props}>
      <Card shadow="sm" radius="md" withBorder>
        <Stack gap="xs" align="center">
          <Title order={3}>Create your account</Title>
          <Text size="sm" c="dimmed">
            Enter your email below to create your account
          </Text>
        </Stack>
        <Stack gap="md" mt="md">
          <EmailPasswordSignup />
          <RedirectionNotice
            msg="Already have an account"
            link="/login"
            linkLabel="Sign in"
          />
        </Stack>
        <PrivacyNotice />
      </Card>
    </Stack>
  );
}

type EmailPass = {
  email: string;
  password: string;
  confirmedPass: string;
};

function EmailPasswordSignup() {
  const form = useForm<EmailPass>({
    initialValues: { email: '', password: '', confirmedPass: '' },
    validate: {
      email: (value) =>
        /^\S+@\S+$/.test(value) ? null : 'Please enter a valid email',
      password: (value) =>
        value.length >= 8 ? null : 'Password should be at least 8 chars long.',
      confirmedPass: (value, values) =>
        value === values.password ? null : 'Passwords must match',
    },
    validateInputOnBlur: true,
  });
  const [submitState, setSubmitState] = useState<PendingAction>('initial');
  const { navigation, notify } = useAppServices();

  return (
    <form
      onSubmit={form.onSubmit(async (val) => {
        setSubmitState('pending');
        try {
          await signUp({
            email: val.email,
            password: val.password,
          });
          notify.success('Sign up successful, redirecting.');
          setSubmitState('done');
          navigation.navigate('/login');
        } catch (err) {
          notify.error(
            err instanceof Error
              ? err.message
              : 'Could not sign up, please try again.',
          );
          setSubmitState('initial');
        }
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
        <Stack gap="sm">
          <PasswordInput
            label="Password"
            id="password"
            required
            {...form.getInputProps('password')}
          />
          <PasswordInput
            label="Confirm Password"
            id="confirm-password"
            required
            {...form.getInputProps('confirmedPass')}
          />
        </Stack>
        <Text size="xs" c="dimmed">
          Must be at least 8 characters long.
        </Text>
        <Button type="submit" disabled={submitState === 'pending'}>
          Create Account
        </Button>
      </Stack>
    </form>
  );
}
