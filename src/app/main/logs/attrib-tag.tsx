import { Autocomplete, Loader } from '@mantine/core';
import { useRef, useState } from 'react';

export type AttribTagProps = {
  value: string;
  suggestionsSupplier: (query: string) => Promise<string[]>;
  onChange: (value: string) => void;
};

export function AttribTag({
  value,
  suggestionsSupplier,
  onChange,
}: AttribTagProps) {
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
    <Autocomplete
      aria-label="Attribute"
      placeholder="attribute"
      value={value}
      data={suggestions}
      onChange={(nextValue) => {
        onChange(nextValue);
        loadSuggestions(nextValue);
      }}
      onFocus={() => loadSuggestions(value)}
      rightSection={loading ? <AutocompleteLoader /> : undefined}
      rightSectionPointerEvents="none"
      size="xs"
      flex={1}
    />
  );
}

function AutocompleteLoader() {
  return <Loader size={14} />;
}
