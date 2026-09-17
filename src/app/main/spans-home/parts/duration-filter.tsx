import { Group, NumberInput } from '@mantine/core';
import { useSpansHomeStore } from '../store';

export function DurationFilter() {
  const durationMinMs = useSpansHomeStore((state) => state.durationMinMs);
  const durationMaxMs = useSpansHomeStore((state) => state.durationMaxMs);
  const setDurationMinMs = useSpansHomeStore((state) => state.setDurationMinMs);
  const setDurationMaxMs = useSpansHomeStore((state) => state.setDurationMaxMs);

  const minValue = Number(durationMinMs);
  const maxValue = Number(durationMaxMs);

  return (
    <Group align="flex-end" wrap="wrap">
      <NumberInput
        size="xs"
        label="Duration min (ms)"
        placeholder="0"
        value={
          durationMinMs
            ? Number.isNaN(minValue)
              ? undefined
              : minValue
            : undefined
        }
        onChange={(next) =>
          setDurationMinMs(next === '' || next === null ? '' : String(next))
        }
        hideControls
      />
      <NumberInput
        size="xs"
        label="Duration max (ms)"
        placeholder="1000"
        value={
          durationMaxMs
            ? Number.isNaN(maxValue)
              ? undefined
              : maxValue
            : undefined
        }
        onChange={(next) =>
          setDurationMaxMs(next === '' || next === null ? '' : String(next))
        }
        hideControls
      />
    </Group>
  );
}
