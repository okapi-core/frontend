import { Autocomplete, Loader, NumberInput } from '@mantine/core';
import { useRef, useState } from 'react';

export type AttributeInputType = 'string' | 'int' | 'long' | 'double';

export type AttribTagValueProps = {
  value: string;
  suggestionsSupplier: (query: string) => Promise<string[]>;
  disabled?: boolean;
  inputType?: AttributeInputType;
  onChange: (value: string) => void;
};

export function AttribTagValue({
  value,
  suggestionsSupplier,
  disabled = false,
  inputType = 'string',
  onChange,
}: AttribTagValueProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);

  const loadSuggestions = async (query: string) => {
    const currentRequestId = ++requestId.current;
    setLoading(true);
    try {
      const nextSuggestions = await suggestionsSupplier(query);
      if (currentRequestId === requestId.current) {
        setSuggestions(nextSuggestions);
      }
    } finally {
      if (currentRequestId === requestId.current) {
        setLoading(false);
      }
    }
  };

  return (
    inputType !== 'string' ? (
      <NumberInput
        aria-label="Attribute value"
        placeholder="value"
        value={value}
        onChange={(nextValue) => onChange(String(nextValue))}
        disabled={disabled}
        rightSection={loading ? <AutocompleteLoader /> : undefined}
        rightSectionPointerEvents="none"
        hideControls
        size="xs"
        flex={1}
      />
    ) : (
      <Autocomplete
        aria-label="Attribute value"
        placeholder="value"
        value={value}
        data={suggestions}
        onChange={(nextValue) => {
          onChange(nextValue);
          void loadSuggestions(nextValue);
        }}
        onFocus={() => void loadSuggestions(value)}
        disabled={disabled}
        rightSection={loading ? <AutocompleteLoader /> : undefined}
        rightSectionPointerEvents="none"
        size="xs"
        flex={1}
      />
    )
  );
}

function AutocompleteLoader() {
  return <Loader size={14} />;
}
