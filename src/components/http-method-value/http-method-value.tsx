import { Anchor } from '@mantine/core';
import { getHttpMethodColor } from '@/app/main/spans-home/lib';

export function HttpMethodValue({
  val,
  onClick,
}: {
  val: string;
  onClick: ({ v }: { v: string }) => void;
}) {
  const normalized = val.trim().toUpperCase();
  const color = getHttpMethodColor(normalized);
  return (
    <Anchor
      component="button"
      type="button"
      size="xs"
      c={color}
      onClick={() => onClick({ v: val })}
    >
      {normalized}
    </Anchor>
  );
}
