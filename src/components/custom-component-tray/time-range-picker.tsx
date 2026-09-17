'use client';
import { Button, Group, Text, TextInput } from '@mantine/core';

export type TimeRange = { startMs: number; endMs: number };

export function TimeRangePicker({
  value,
  onChange,
}: {
  value: TimeRange;
  onChange: (v: TimeRange) => void;
}) {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const toLocalInputValue = (ms: number) => {
    const d = new Date(ms);
    const yyyy = d.getFullYear();
    const MM = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
  };
  const fromInputValue = (s: string) =>
    s ? new Date(s).getTime() : Date.now();

  const setQuick = (mins: number) => {
    const end = Date.now();
    const start = end - mins * 60 * 1000;
    onChange({ startMs: start, endMs: end });
  };

  return (
    <Group gap="xs" align="center">
      <TextInput
        type="datetime-local"
        value={toLocalInputValue(value.startMs)}
        onChange={(e) =>
          onChange({
            startMs: fromInputValue(e.target.value),
            endMs: value.endMs,
          })
        }
        size="xs"
      />
      <Text size="xs" c="dimmed">
        to
      </Text>
      <TextInput
        type="datetime-local"
        value={toLocalInputValue(value.endMs)}
        onChange={(e) =>
          onChange({
            startMs: value.startMs,
            endMs: fromInputValue(e.target.value),
          })
        }
        size="xs"
      />
      <Group gap={4}>
        <Button size="xs" variant="default" onClick={() => setQuick(15)}>
          15m
        </Button>
        <Button size="xs" variant="default" onClick={() => setQuick(60)}>
          1h
        </Button>
        <Button size="xs" variant="default" onClick={() => setQuick(6 * 60)}>
          6h
        </Button>
      </Group>
    </Group>
  );
}

export default TimeRangePicker;
