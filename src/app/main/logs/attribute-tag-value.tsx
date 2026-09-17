import { ActionIcon, Group } from '@mantine/core';
import { X } from 'lucide-react';
import { AttribTag } from './attrib-tag';
import type { AttributeInputType } from './attrib-tag-value';
import { AttribTagValue } from './attrib-tag-value';
import { AttributeValueTypeButton } from './attribute-value-type-button';
import type { ChLogFilterOp } from '@/lib/request-types';
import { FilterOp } from './filter-op';

export type AttributeTagValueProps = {
  attribute: string;
  op: ChLogFilterOp;
  value: string;
  inputType: AttributeInputType;
  attributeSuggestionsSupplier: (query: string) => Promise<string[]>;
  valueSuggestionsSupplier: (query: string) => Promise<string[]>;
  valueDisabled?: boolean;
  onAttributeChange: (value: string) => void;
  onOpChange: (value: ChLogFilterOp) => void;
  onValueChange: (value: string) => void;
  onInputTypeChange: (inputType: AttributeInputType) => void;
  onRemove: () => void;
};

export function AttributeTagValue({
  attribute,
  op,
  value,
  inputType,
  attributeSuggestionsSupplier,
  valueSuggestionsSupplier,
  valueDisabled = false,
  onAttributeChange,
  onOpChange,
  onValueChange,
  onInputTypeChange,
  onRemove,
}: AttributeTagValueProps) {
  return (
    <Group align="flex-end" gap="xs" wrap="nowrap">
      <AttribTag
        value={attribute}
        suggestionsSupplier={attributeSuggestionsSupplier}
        onChange={onAttributeChange}
      />
      <FilterOp value={op} onChange={onOpChange} />
      <AttribTagValue
        value={value}
        suggestionsSupplier={valueSuggestionsSupplier}
        inputType={inputType}
        disabled={
          valueDisabled || op === 'EXISTS' || op === 'NOT_EXISTS'
        }
        onChange={onValueChange}
      />
      <AttributeValueTypeButton
        inputType={inputType}
        onChange={onInputTypeChange}
      />
      <ActionIcon
        type="button"
        variant="subtle"
        color="gray"
        aria-label="Remove filter"
        onClick={onRemove}
      >
        <X size={15} />
      </ActionIcon>
    </Group>
  );
}
