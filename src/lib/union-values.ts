import type { UnionValue } from './response-types';
import type { PrimitiveValue } from './types';

export function extractUnionValue(
  value?: UnionValue,
): PrimitiveValue {
  if (value?.stringValue !== undefined) return value.stringValue;
  if (value?.doubleValue !== undefined) return value.doubleValue;
  if (value?.integerValue !== undefined) return value.integerValue;
  if (value?.longValue !== undefined) return value.longValue;
  if (value?.booleanValue !== undefined) return value.booleanValue;
  return undefined;
}

export function formatUnionValue(value?: UnionValue): string | undefined {
  const extracted = extractUnionValue(value);
  return extracted === undefined ? undefined : String(extracted);
}
