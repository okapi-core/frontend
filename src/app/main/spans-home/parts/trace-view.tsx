import { AttributeLabel } from '@/components/attribute-label';
import { SpanAttributeValue } from '@/components/span-attribute-value/span-attribute-value';
import {
  milliDurationBetweenNs,
  nanosToHuman,
  truncateToN,
} from '@/lib/date-conversions';
import { SpanRowV2 } from '@/lib/response-types';
import {
  getSpanAttributeLabel,
  SPAN_ID,
  TRACE_ID,
} from '@/lib/span-attributes';
import { Group, Stack, Text } from '@mantine/core';
import { camelCase } from 'lodash';

export function TraceView({ row }: { row: SpanRowV2 }) {
  const noOp = () => {};
  return (
    <Stack gap="xs">
      <Group gap="xs" align="center">
        <AttributeLabel label={getSpanAttributeLabel(TRACE_ID)} />
        <SpanAttributeValue
          onClick={noOp}
          attr={camelCase(TRACE_ID)}
          value={row.traceId || 'unknown trace id'}
        />
      </Group>
      <Group gap="xs" align="center">
        <AttributeLabel label={getSpanAttributeLabel(SPAN_ID)} />
        <SpanAttributeValue
          onClick={noOp}
          attr={camelCase(SPAN_ID)}
          value={row.spanId || 'unknown span id'}
        />
      </Group>
      {row.tsStartNs ? (
        <Group gap="xs" align="center">
          <AttributeLabel label="start" />
          <Text size="xs">{nanosToHuman({ nanos: row.tsStartNs })}</Text>
        </Group>
      ) : null}
      {row.tsEndNs ? (
        <Group gap="xs" align="center">
          <AttributeLabel label="end" />
          <Text size="xs">{nanosToHuman({ nanos: row.tsEndNs })}</Text>
        </Group>
      ) : null}
      {row.tsStartNs && row.tsEndNs ? (
        <Group gap="xs" align="center">
          <AttributeLabel label="duration" />
          <SpanAttributeValue
            onClick={noOp}
            attr="durationMillis"
            value={truncateToN({
              value: milliDurationBetweenNs({
                startNs: row.tsStartNs,
                endNs: row.tsEndNs,
              }),
              places: 2,
            })}
          />
        </Group>
      ) : null}
      {row.parentSpanId ? (
        <Group gap="xs" align="center">
          <AttributeLabel label="parent span id" />
          <SpanAttributeValue
            onClick={noOp}
            attr={camelCase(SPAN_ID)}
            value={row.parentSpanId}
          />
        </Group>
      ) : null}
    </Stack>
  );
}
