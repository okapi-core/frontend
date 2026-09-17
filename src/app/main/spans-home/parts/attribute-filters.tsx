import { Stack } from '@mantine/core';
import { useSpansHomeStore } from '../store';
import { AttributeFilterSection } from './attribute-filter-section';

export function AttributeFilters() {
  const stringAttributes = useSpansHomeStore((state) => state.stringAttributes);
  const numberAttributes = useSpansHomeStore((state) => state.numberAttributes);
  const setStringAttributes = useSpansHomeStore(
    (state) => state.setStringAttributes,
  );
  const setNumberAttributes = useSpansHomeStore(
    (state) => state.setNumberAttributes,
  );

  const addStringAttribute = () => {
    setStringAttributes([...stringAttributes, { key: '', value: '' }]);
  };

  const addNumberAttribute = () => {
    setNumberAttributes([...numberAttributes, { key: '', value: '' }]);
  };

  return (
    <Stack gap="md">
      <AttributeFilterSection
        label="String attributes"
        rows={stringAttributes}
        onChange={setStringAttributes}
        onAdd={addStringAttribute}
        valueLabel="Value"
      />
      <AttributeFilterSection
        label="Number attributes"
        rows={numberAttributes}
        onChange={setNumberAttributes}
        onAdd={addNumberAttribute}
        valueLabel="Value (number)"
        isNumberValue
      />
    </Stack>
  );
}
