import { Autocomplete } from '@mantine/core';
import { useAttribValueHints } from '../queries';

export function SpanStringAttributePicker({
  label,
  placeholder,
  value,
  attrib,
  onChange,
}: {
  label: string;
  placeholder: string;
  value?: string;
  attrib: string;
  onChange: (v: string) => void;
}) {
  const hints = useAttribValueHints({ attrib });
  return (
    <Autocomplete
      data={hints.data?.data?.values}
      onFocus={() => {}}
      size="xs"
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange?.(event)}
      clearable
    />
  );
}
