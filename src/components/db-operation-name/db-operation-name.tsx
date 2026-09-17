import { getDbOperationColor } from '@/app/main/spans-home/lib';
import { Anchor, MantineSize } from '@mantine/core';

export function DbOperationName({
  size = 'sm',
  val,
  onClick,
}: {
  size?: MantineSize;
  val: string;
  onClick: (v: string) => void;
}) {
  const normalized = val.trim();
  const display = formatOperation(normalized);
  const color = getDbOperationColor(normalized);
  return (
    <Anchor
      component="button"
      type="button"
      size={size}
      c={color}
      title={val}
      onClick={() => onClick(val)}
    >
      {display}
    </Anchor>
  );
}

function formatOperation(value: string) {
  const tokens = value.trim().split(/\s+/);
  if (!tokens.length) return value;
  const head = tokens[0]?.toUpperCase() || value;
  if (tokens.length === 1) return head;
  return `${head} …`;
}
