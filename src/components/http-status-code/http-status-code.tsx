import { getHttpStatusColor } from '@/app/main/spans-home/lib';
import { Anchor, MantineSize } from '@mantine/core';

export function HttpStatusCode({
  size = 'xs',
  val,
  onClick,
}: {
  size?: MantineSize;
  val: number;
  onClick: (v: number) => void;
}) {
  const color = getHttpStatusColor(val);
  return (
    <Anchor
      component="button"
      type="button"
      size={size}
      c={color}
      onClick={() => onClick(val)}
    >
      {val}
    </Anchor>
  );
}
