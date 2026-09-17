import { Autocomplete, NumberInput } from '@mantine/core';
import { useAttribValueHints } from '../queries';

export function AttributeFilterInput({
  label,
  value,
  isANumber,
  attrib,
  onChange,
}: {
  label: string;
  value: string;
  isANumber: boolean;
  attrib: string;
  onChange: (v: string | number) => void;
}) {
  const hints = useAttribValueHints({ attrib });
  return isANumber ? (
    <NumberInput
      size="xs"
      label={label}
      placeholder="0"
      value={value}
      onChange={(next) => onChange(next)}
      hideControls
      w="100%"
    />
  ) : (
    <Autocomplete
      size="xs"
      data={hints.data?.data?.values}
      label={label}
      placeholder="value"
      value={value}
      onChange={(event) => onChange(event)}
      w="100%"
    />
  );
}
