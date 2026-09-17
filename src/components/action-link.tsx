'use client';

import { Text } from '@mantine/core';

export function ActionLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Text component="a" size="sm" c="blue.6" href={href}>
      {children}
    </Text>
  );
}
