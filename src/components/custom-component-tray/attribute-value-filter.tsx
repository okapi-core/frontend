'use client';
import {
  useSpanAttributeHintsQuery,
  useSpanAttributeValueHintsQuery,
} from '@/lib/domain/spans';
import { generateRandomId } from '@/lib/id-gen';
import { SpanAttributeHint } from '@/lib/response-types';
import {
  ActionIcon,
  Autocomplete,
  Button,
  Group,
  NumberInput,
  Stack,
  Text,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { Minus, Plus } from 'lucide-react';
import { useMemo } from 'react';
import { TimeRange } from './time-range-picker';

export type AttributeValueFilterRow = {
  id: string;
  key: string;
  value: string;
  type?: 'string' | 'number';
};

function inferAttributeType(hintType?: string): 'string' | 'number' {
  if (!hintType) return 'string';
  const normalized = hintType.toLowerCase();
  if (
    normalized.includes('int') ||
    normalized.includes('float') ||
    normalized.includes('double') ||
    normalized.includes('number') ||
    normalized.includes('long')
  ) {
    return 'number';
  }
  return 'string';
}

export function AttributeValueFilter({
  label = 'Attribute filters',
  filters,
  onChange,
  timeRange,
}: {
  label?: string;
  filters: AttributeValueFilterRow[];
  onChange: (next: AttributeValueFilterRow[]) => void;
  timeRange: TimeRange;
}) {
  const attrHintsQuery = useSpanAttributeHintsQuery({
    timestampFilter: {
      tsMillisStart: timeRange.startMs,
      tsMillisEnd: timeRange.endMs,
    },
  });

  const attrHints = [
    ...(attrHintsQuery.data?.data?.defaultAttributes || []),
    ...(attrHintsQuery.data?.data?.customAttributes || []),
  ] as SpanAttributeHint[];
  const attrNames = useMemo(
    () => attrHints.map((h) => h.name).filter(Boolean) as string[],
    [attrHints],
  );
  const attrTypeMap = useMemo(() => {
    const map = new Map<string, 'string' | 'number'>();
    attrHints.forEach((h) => {
      if (!h.name) return;
      map.set(h.name, inferAttributeType(h.type));
    });
    return map;
  }, [attrHints]);

  const updateRow = (id: string, patch: Partial<AttributeValueFilterRow>) => {
    onChange(
      filters.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  };

  const addRow = () => {
    onChange([
      ...filters,
      { id: generateRandomId(8), key: '', value: '', type: 'string' },
    ]);
  };

  const removeRow = (id: string) => {
    onChange(filters.filter((row) => row.id !== id));
  };

  return (
    <Stack gap="xs">
      <Group justify="space-between" align="center">
        <Text size="sm" fw={600}>
          {label}
        </Text>
        <Button
          size="xs"
          variant="default"
          leftSection={<Plus size={14} />}
          onClick={addRow}
        >
          Add filter
        </Button>
      </Group>
      <Stack gap="xs">
        {filters.length === 0 ? (
          <Text size="xs" c="dimmed">
            No attribute filters yet.
          </Text>
        ) : null}
        {filters.map((row) => (
          <AttributeValueFilterRowEditor
            key={row.id}
            row={row}
            attrNames={attrNames}
            attrTypeMap={attrTypeMap}
            timeRange={timeRange}
            onChange={updateRow}
            onRemove={removeRow}
          />
        ))}
      </Stack>
    </Stack>
  );
}

function AttributeValueFilterRowEditor({
  row,
  attrNames,
  attrTypeMap,
  timeRange,
  onChange,
  onRemove,
}: {
  row: AttributeValueFilterRow;
  attrNames: string[];
  attrTypeMap: Map<string, 'string' | 'number'>;
  timeRange: TimeRange;
  onChange: (id: string, patch: Partial<AttributeValueFilterRow>) => void;
  onRemove: (id: string) => void;
}) {
  const [debouncedName] = useDebouncedValue(row.key, 200);
  const [debouncedValue] = useDebouncedValue(row.value, 200);
  const valueHintsQuery = useSpanAttributeValueHintsQuery({
    attributeName: row.key,
    timestampFilter: {
      tsMillisStart: timeRange.startMs,
      tsMillisEnd: timeRange.endMs,
    },
  });

  const nameSuggestions = useMemo(() => {
    if (!debouncedName) return attrNames;
    const q = debouncedName.toLowerCase();
    return attrNames.filter((name) => name.toLowerCase().includes(q));
  }, [attrNames, debouncedName]);

  const valueSuggestions = useMemo(() => {
    const values = valueHintsQuery.data?.data?.values || [];
    if (!debouncedValue) return values;
    const q = debouncedValue.toLowerCase();
    return values.filter((v) => v.toLowerCase().includes(q));
  }, [valueHintsQuery.data, debouncedValue]);

  const inferredType = attrTypeMap.get(row.key) || row.type || 'string';
  const numericValue = Number.isNaN(Number(row.value))
    ? undefined
    : Number(row.value);

  return (
    <Group align="flex-end" wrap="nowrap">
      <Autocomplete
        label="Attribute"
        placeholder="service.name"
        data={nameSuggestions}
        value={row.key}
        onChange={(next) => {
          onChange(row.id, {
            key: next,
            type: attrTypeMap.get(next) || 'string',
          });
        }}
        size="sm"
        w="100%"
      />
      {inferredType === 'number' ? (
        <NumberInput
          label="Value"
          placeholder="0"
          value={row.value ? numericValue : undefined}
          onChange={(next) =>
            onChange(row.id, {
              value: next === '' || next === null ? '' : String(next),
              type: 'number',
            })
          }
          hideControls
          size="sm"
          w="100%"
        />
      ) : (
        <Autocomplete
          label="Value"
          placeholder="value"
          data={valueSuggestions}
          value={row.value}
          onChange={(next) => onChange(row.id, { value: next })}
          size="sm"
          w="100%"
        />
      )}
      <ActionIcon
        variant="subtle"
        color="gray"
        onClick={() => onRemove(row.id)}
        aria-label="Remove filter"
        mb={6}
      >
        <Minus size={16} />
      </ActionIcon>
    </Group>
  );
}

export default AttributeValueFilter;
