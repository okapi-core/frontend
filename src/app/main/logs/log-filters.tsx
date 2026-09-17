import type {
  ChLogFilter,
  ChLogFilterOp,
  UNION_TYPE,
  UnionValue,
} from '@/lib/request-types';
import { Button, Group, Stack, Text } from '@mantine/core';
import { Plus } from 'lucide-react';
import { FormEvent, useState } from 'react';
import type { AttributeInputType } from './attrib-tag-value';
import { AttributeTagValue } from './attribute-tag-value';

export type LogFilterRow = {
  id: string;
  key: string;
  op: ChLogFilterOp;
  value: string;
  inputType: AttributeInputType;
};

export type LogFiltersProps = {
  initialFilters?: LogFilterRow[];
  getAttributeSuggestions?: (query: string) => Promise<string[]>;
  getValueSuggestions?: (args: {
    key: string;
    op: ChLogFilterOp;
    query: string;
    type: UNION_TYPE;
    filters: ChLogFilter[];
  }) => Promise<string[]>;
  onFiltersChange?: (filters: LogFilterRow[]) => void;
  onSubmit?: (filters: ChLogFilter[]) => void;
};

let nextFilterId = 0;

function createFilterRow(): LogFilterRow {
  nextFilterId += 1;
  return {
    id: `log-filter-${nextFilterId}`,
    key: '',
    op: 'EQ',
    value: '',
    inputType: 'string',
  };
}

export function LogFilters({
  initialFilters,
  getAttributeSuggestions = emptySuggestions,
  getValueSuggestions = emptyValueSuggestions,
  onFiltersChange,
  onSubmit,
}: LogFiltersProps) {
  const [rows, setRows] = useState<LogFilterRow[]>(
    () => initialFilters ?? [createFilterRow()],
  );

  const updateRows = (nextRows: LogFilterRow[]) => {
    setRows(nextRows);
    onFiltersChange?.(nextRows);
  };

  const updateRow = (id: string, update: Partial<Omit<LogFilterRow, 'id'>>) => {
    updateRows(
      rows.map((row) => {
        if (row.id !== id) return row;
        const nextRow = { ...row, ...update };
        if (nextRow.op === 'EXISTS' || nextRow.op === 'NOT_EXISTS') {
          nextRow.value = '';
        }
        return nextRow;
      }),
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit?.(toLogFilters(rows));
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="sm">
        <Group justify="space-between" align="center">
          <Text size="sm" fw={600}>
            Filters
          </Text>
          <Button
            type="button"
            size="xs"
            variant="default"
            leftSection={<Plus size={14} />}
            onClick={() => updateRows([...rows, createFilterRow()])}
          >
            Add filter
          </Button>
        </Group>

        <Stack gap="xs">
          {rows.map((row) => (
            <AttributeTagValue
              key={row.id}
              attribute={row.key}
              op={row.op}
              value={row.value}
              inputType={row.inputType}
              attributeSuggestionsSupplier={getAttributeSuggestions}
              valueSuggestionsSupplier={(query) =>
                getValueSuggestions({
                  key: row.key,
                  op: row.op,
                  query,
                  type: toApiUnionType(row.inputType),
                  filters: toLogFilters(rows),
                })
              }
              valueDisabled={!row.key}
              onAttributeChange={(key) => updateRow(row.id, { key })}
              onOpChange={(op) => updateRow(row.id, { op })}
              onValueChange={(value) => updateRow(row.id, { value })}
              onInputTypeChange={(inputType) =>
                updateRow(row.id, { inputType })
              }
              onRemove={() =>
                updateRows(rows.filter(({ id }) => id !== row.id))
              }
            />
          ))}
        </Stack>

        <Group justify="flex-end">
          <Button type="submit" size="xs">
            Apply filters
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

const emptySuggestions = async (_query: string): Promise<string[]> => [];

const emptyValueSuggestions = async (_args: {
  key: string;
  op: ChLogFilterOp;
  query: string;
  type: UNION_TYPE;
  filters: ChLogFilter[];
}): Promise<string[]> => [];

function toApiUnionType(inputType: AttributeInputType): UNION_TYPE {
  switch (inputType) {
    case 'string':
      return 'STRING';
    case 'int':
      return 'INTEGER';
    case 'long':
      return 'LONG';
    case 'double':
      return 'DOUBLE';
  }
}

function toLogFilters(rows: LogFilterRow[]): ChLogFilter[] {
  return rows.flatMap((row): ChLogFilter[] => {
    const key = row.key.trim();
    const value = row.value.trim();
    if (!key) return [];
    if (row.op === 'EXISTS' || row.op === 'NOT_EXISTS') {
      return [{ key, op: row.op }];
    }

    if (!value) return [];
    if (row.inputType !== 'string' && Number.isNaN(Number(value))) {
      return [];
    }

    return [
      {
        key,
        op: row.op,
        value: toUnionValue(row, value, row.inputType),
      },
    ];
  });
}

function toUnionValue(
  _row: LogFilterRow,
  value: string,
  userSpecifiedType: AttributeInputType,
): UnionValue {
  switch (userSpecifiedType) {
    case 'int':
      return { type: 'INTEGER', integerValue: Number(value) };
    case 'long':
      return { type: 'LONG', longValue: Number(value) };
    case 'double':
      return { type: 'DOUBLE', doubleValue: Number(value) };
    case 'string':
      return { type: 'STRING', stringValue: value };
  }
}
