import { Select } from '@mantine/core';
import type { ChLogFilterOp } from '@/lib/request-types';

export type FilterOpProps = {
  value: ChLogFilterOp;
  onChange: (value: ChLogFilterOp) => void;
};

const filterOpOptions: { value: ChLogFilterOp; label: string }[] = [
  { value: 'EQ', label: '=' },
  { value: 'NEQ', label: '!=' },
  { value: 'CONTAINS', label: 'contains' },
  { value: 'REGEX', label: 'matches' },
  { value: 'PREFIX', label: 'starts with' },
  { value: 'GT', label: '>' },
  { value: 'GTE', label: '>=' },
  { value: 'LT', label: '<' },
  { value: 'LTE', label: '<=' },
  { value: 'EXISTS', label: 'exists' },
  { value: 'NOT_EXISTS', label: 'does not exist' },
];

export function FilterOp({ value, onChange }: FilterOpProps) {
  return (
    <Select
      aria-label="Filter operator"
      data={filterOpOptions}
      value={value}
      onChange={(nextValue) => {
        if (nextValue) onChange(nextValue as ChLogFilterOp);
      }}
      allowDeselect={false}
      size="xs"
      w={125}
    />
  );
}
