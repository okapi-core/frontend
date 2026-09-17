import { Button, Checkbox, Menu, Text, TextInput } from '@mantine/core';
import { type ReactNode, useState } from 'react';

export function MultiSelectMenu({
  title,
  choices,
  value,
  onChange,
  searchable = false,
}: {
  title: ReactNode;
  choices: { value: string; label: string }[];
  value: string[];
  onChange: (next: string[]) => void;
  searchable?: boolean;
}) {
  const [search, setSearch] = useState('');
  const visibleChoices = searchable
    ? choices.filter((choice) =>
        `${choice.label} ${choice.value}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      )
    : choices;

  return (
    <Menu shadow="md" width={220}>
      <Menu.Target>
        <Button size="xs" variant="light">
          {title}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        {searchable && (
          <TextInput
            aria-label="Search choices"
            placeholder="Search"
            size="xs"
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            mb="xs"
          />
        )}
        <Checkbox.Group value={value} onChange={onChange}>
          {visibleChoices.length > 0 ? (
            visibleChoices.map((choice) => (
              <Checkbox
                key={choice.value}
                value={choice.value}
                label={choice.label}
                size="xs"
                mb={6}
              />
            ))
          ) : (
            <Text size="xs" c="dimmed">
              No matches
            </Text>
          )}
        </Checkbox.Group>
      </Menu.Dropdown>
    </Menu>
  );
}
