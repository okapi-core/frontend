'use client';
import { PageCanvas } from '@/components/page-canvas';
import { useAppServices } from '@/lib/app-services';
import { useUserData } from '@/lib/context';
import { useProfileApi } from '@/lib/domain/profile';
import { UpdateUserRequest } from '@/lib/request-types';
import { Button, PasswordInput, Stack, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect, useState } from 'react';

export default function Page() {
  const { currentOrg } = useUserData();

  return (
    <PageCanvas
      path={[{ label: 'Profile', href: '/main/profile' }]}
      inner={<Inner />}
      sidebarProps={{
        org: currentOrg,
        activeItem: 'profile',
      }}
    />
  );
}

function Inner() {
  return (
    <Stack p="md" gap="md" maw={640}>
      <Title order={4}>Edit profile</Title>
      <ProfileEditor />
    </Stack>
  );
}

type UpdateProfileMsg = {
  firstName: string;
  lastName: string;
  password: string;
  oldPassword: string;
};

function ProfileEditor() {
  const { userProfile } = useUserData();
  const profileApi = useProfileApi();
  const { notify } = useAppServices();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateProfileMsg>({
    initialValues: {
      firstName: '',
      lastName: '',
      password: '',
      oldPassword: '',
    },
    validate: {
      password: (value) =>
        value.length === 0 || value.length >= 8
          ? null
          : 'Password should be at least 8 chars long.',
      oldPassword: (value, values) =>
        values.password && !value ? 'Enter your current password' : null,
    },
    validateInputOnBlur: true,
  });

  useEffect(() => {
    const nextFirst = userProfile?.firstName || '';
    const nextLast = userProfile?.lastName || '';
    if (
      form.values.firstName === nextFirst &&
      form.values.lastName === nextLast
    ) {
      return;
    }
    form.setValues((prev) => ({
      ...prev,
      firstName: nextFirst,
      lastName: nextLast,
    }));
    // Only respond to user profile name changes to avoid resetting user input
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile?.firstName, userProfile?.lastName]);

  async function updateProfileInfo(value: UpdateProfileMsg) {
    setIsSubmitting(true);
    try {
      const payload: UpdateUserRequest = {
        firstName: value.firstName,
        lastName: value.lastName,
      };
      if (value.password) {
        payload.password = value.password;
      }
      if (value.oldPassword) {
        payload.oldPassword = value.oldPassword;
      }
      await profileApi.updateProfile(payload);
      notify.success('Profile updated.');
    } catch (err) {
      notify.error(
        err instanceof Error ? err.message : 'Failed to update profile',
      );
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <form onSubmit={form.onSubmit(updateProfileInfo)}>
      <Stack gap="sm">
        <TextInput
          label="First name"
          type="text"
          id="first-name-field"
          {...form.getInputProps('firstName')}
        />
        <TextInput
          label="Last name"
          type="text"
          id="last-name-field"
          {...form.getInputProps('lastName')}
        />
        <PasswordInput
          label="New password"
          id="new-password"
          {...form.getInputProps('password')}
        />
        <PasswordInput
          label="Old password if you are updating password"
          {...form.getInputProps('oldPassword')}
        />
        <Button disabled={isSubmitting} loading={isSubmitting} type="submit">
          Save
        </Button>
      </Stack>
    </form>
  );
}
