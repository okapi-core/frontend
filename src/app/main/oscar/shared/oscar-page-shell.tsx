import { PageCanvas } from '@/components/page-canvas';
import { useUserData } from '@/lib/context';
import { ReactNode } from 'react';

export function OscarPageShell({ children }: { children: ReactNode }) {
  const { currentOrg } = useUserData();

  return (
    <PageCanvas
      path={[{ label: 'Oscar', href: '/main/oscar' }]}
      inner={children}
      sidebarProps={{
        org: currentOrg,
        activeItem: 'oscar',
      }}
    />
  );
}
