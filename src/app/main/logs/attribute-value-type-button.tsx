import { ActionIcon, Tooltip } from '@mantine/core';
import { Hash, Type } from 'lucide-react';
import type { AttributeInputType } from './attrib-tag-value';

export type AttributeValueTypeButtonProps = {
  inputType: AttributeInputType;
  onChange: (inputType: AttributeInputType) => void;
};

export function AttributeValueTypeButton({
  inputType,
  onChange,
}: AttributeValueTypeButtonProps) {
  const inputTypes: AttributeInputType[] = [
    'string',
    'int',
    'long',
    'double',
  ];
  const nextInputType =
    inputTypes[(inputTypes.indexOf(inputType) + 1) % inputTypes.length];
  const label = `Change value type to ${nextInputType}`;

  return (
    <Tooltip label={label} withArrow>
      <ActionIcon
        type="button"
        variant="subtle"
        color="gray"
        aria-label={label}
        onClick={() => onChange(nextInputType)}
      >
        {inputType === 'string' ? <Type size={15} /> : <Hash size={15} />}
      </ActionIcon>
    </Tooltip>
  );
}
