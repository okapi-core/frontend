import { useOscarHomeApi } from '@/lib/domain/chat';

export function useCreateSession() {
  return useOscarHomeApi();
}
