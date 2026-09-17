import { createUser, signInWithPass } from '@/lib/api';
import { postWithoutToken } from '@/lib/api-common';
import { checkIfRequestFailed } from '@/lib/api-responses';
import { CreateUserRequest, SignInRequest } from '@/lib/request-types';
import { useMutation } from '@tanstack/react-query';

export async function signIn(request: SignInRequest) {
  const res = await signInWithPass({ request });
  if (checkIfRequestFailed(res)) {
    throw new Error(res.error || 'Could not sign in');
  }
  return res;
}

export async function signUp(request: CreateUserRequest) {
  let res;
  try {
    res = await createUser({ request });
  } catch {
    throw new Error('Could not sign up, please try again.');
  }
  if (checkIfRequestFailed(res)) {
    throw new Error(res.error || 'Could not sign up');
  }
  return res;
}

export function useAuthApi() {
  const signOutMutation = useMutation({
    mutationFn: async () => {
      const res = await postWithoutToken<undefined, void>({
        url: '/api/v1/users/sign-out',
        request: undefined,
      });
      if (checkIfRequestFailed(res)) {
        throw new Error(res.error || 'Could not sign out');
      }
      return res;
    },
  });

  return {
    signOut: signOutMutation.mutateAsync,
    signOutPending: signOutMutation.isPending,
  };
}
