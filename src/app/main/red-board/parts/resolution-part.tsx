import { RES_TYPE } from '@/lib/request-types';
import { Group, Radio, Stack, Text } from '@mantine/core';
import { useRedBoardStore } from '../store';

const RES_OPTIONS: { label: string; value: RES_TYPE }[] = [
  { label: 'secondly', value: 'SECONDLY' },
  { label: 'minutely', value: 'MINUTELY' },
  { label: 'hourly', value: 'HOURLY' },
];

export function ResolutionPart() {
  const resType = useRedBoardStore((state) => state.resType);
  const setResType = useRedBoardStore((state) => state.setResType);

  return (
    <Stack gap="xs">
      <Text c="gray.6" fw={600}>
        resolution
      </Text>
      <Radio.Group
        value={resType}
        onChange={(value) => setResType(value as RES_TYPE)}
      >
        <Group gap="sm">
          {RES_OPTIONS.map((opt) => (
            <Radio key={opt.value} value={opt.value} label={opt.label} />
          ))}
        </Group>
      </Radio.Group>
    </Stack>
  );
}
