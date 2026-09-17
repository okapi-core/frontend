'use client';

export type DashboardTagKey =
  | 'databases'
  | 'infrastructure'
  | 'network'
  | 'kubernetes'
  | 'ui'
  | 'servers'
  | 'api'
  | 'slo'
  | 'availability';

import { Badge } from '@mantine/core';

export const DashboardTagStyles: Record<string, { color: string }> = {
  databases: { color: 'blue' },
  infrastructure: { color: 'gray' },
  network: { color: 'green' },
  kubernetes: { color: 'indigo' },
  ui: { color: 'pink' },
  servers: { color: 'cyan' },
  api: { color: 'yellow' },
  slo: { color: 'violet' },
  availability: { color: 'teal' },
};

export function DashboardTag({ tag }: { tag: string }) {
  const key = tag?.toLowerCase?.() || '';
  const style = DashboardTagStyles[key];
  return (
    <Badge color={style?.color || 'gray'} variant="light" size="sm" radius="sm">
      {tag}
    </Badge>
  );
}

export default DashboardTag;
