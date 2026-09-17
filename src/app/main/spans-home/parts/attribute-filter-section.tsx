import {
  ActionIcon,
  Autocomplete,
  Button,
  Group,
  Stack,
  Text,
} from '@mantine/core';
import { Minus, Plus } from 'lucide-react';
import { getAttributeList } from '../lib';
import { useAttributeHints } from '../queries';
import { AttributeFilterInput } from './attribute-filter-input';

export function AttributeFilterSection({
  label,
  rows,
  onChange,
  onAdd,
  valueLabel,
  isNumberValue = false,
}: {
  label: string;
  rows: { key: string; value: string }[];
  onChange: (rows: { key: string; value: string }[]) => void;
  onAdd: () => void;
  valueLabel: string;
  isNumberValue?: boolean;
}) {
  const attributeHints = useAttributeHints();
  const updateRow = (
    key: string,
    patch: Partial<{ key: string; value: string }>,
  ) => {
    onChange(rows.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  };

  const removeRow = (key: string) => {
    onChange(rows.filter((row) => row.key !== key));
  };

  const attribList = getAttributeList(attributeHints.data?.data);

  return (
    <Stack gap="xs">
      <Group justify="space-between" align="center">
        <Text size="xs" fw={600}>
          {label}
        </Text>
        <Button
          size="xs"
          variant="default"
          leftSection={<Plus size={14} />}
          onClick={onAdd}
        >
          Add filter
        </Button>
      </Group>
      {rows.length === 0 ? (
        <Text size="xs" c="dimmed">
          No {label.toLowerCase()} yet.
        </Text>
      ) : null}
      <Stack gap="xs">
        {rows.map((row) => (
          <Group key={row.key} align="flex-end" wrap="nowrap">
            <Autocomplete
              size="xs"
              data={attribList}
              label="attribute"
              placeholder="attribute.key"
              value={row.key}
              onChange={(event) => updateRow(row.key, { key: event })}
              w="100%"
            />
            <AttributeFilterInput
              label={'value'}
              value={row.value}
              isANumber={false}
              attrib={row.key}
              onChange={function (v: string | number): void {
                if (typeof v === 'string') updateRow(row.key, { value: v });
              }}
            />

            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => removeRow(row.key)}
              aria-label="Remove filter"
              mb={6}
            >
              <Minus size={16} />
            </ActionIcon>
          </Group>
        ))}
      </Stack>
    </Stack>
  );
}
