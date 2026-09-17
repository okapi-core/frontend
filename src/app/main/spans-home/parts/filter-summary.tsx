import { Badge, Group, Text } from '@mantine/core';
import {
  SpanFilterSummaryCategoryId,
  getSpanFilterSummary,
} from '../lib';
import { selectSpanFilters, useSpansHomeStore } from '../store';

export function FilterSummary({
  include,
}: {
  include?: SpanFilterSummaryCategoryId[];
}) {
  const storeState = useSpansHomeStore();
  const filters = selectSpanFilters(storeState);
  const allSummary = getSpanFilterSummary(filters);
  const categories = include
    ? allSummary.categories.filter((category) => include.includes(category.id))
    : allSummary.categories;
  const total = categories.reduce((sum, category) => sum + category.count, 0);

  return (
    <Group gap="xs" align="center" wrap="wrap">
      <Text size="xs" c={total === 0 ? 'dimmed' : undefined}>
        {total === 0 ? 'No filters active' : `${total} filters active`}
      </Text>
      {categories.map((category) => (
        <Badge key={category.label} size="sm" variant="light">
          {category.label}
        </Badge>
      ))}
    </Group>
  );
}
