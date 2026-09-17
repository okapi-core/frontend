import { SpanAttributeValue } from '@/components/span-attribute-value/span-attribute-value';
import { SERVICE_NAME } from '@/lib/span-attributes';
import { MantineSize } from '@mantine/core';
import { camelCase } from 'lodash';

export function ServiceLabel({
  size = 'xs',
  svc,
  onClick,
}: {
  size?: MantineSize;
  svc: string;
  onClick?: (svc: string) => void;
}) {
  return (
    <SpanAttributeValue
      size={size}
      attr={camelCase(SERVICE_NAME)}
      value={svc}
      onClick={({ val }) => {
        if (typeof val === 'string') {
          onClick?.(val);
        }
      }}
    />
  );
}
