import { getDurationColor } from '@/lib/date-conversions';
import { getHashSelectedColor } from '@/lib/random-color-selector';
import type { PrimitiveValue } from '@/lib/types';
import {
  AttributeClassifier,
  type AttributeContext,
} from '@/lib/attribute-classifier';
import {
  DB_OPERATION_NAME,
  DB_SYSTEM_NAME,
  HTTP_METHOD,
  HTTP_STATUS_CODE,
  SERVICE_NAME,
  SPAN_ID,
  TRACE_ID,
} from '@/lib/span-attributes';
import { Anchor, Badge, Group, MantineSize, Text } from '@mantine/core';
import { camelCase } from 'lodash';
import { ReactNode } from 'react';
import { DbOperationName } from '../db-operation-name/db-operation-name';
import { DbSystemName } from '../db-system-name/db-system-name';
import { HttpMethodValue } from '../http-method-value/http-method-value';
import { HttpStatusCode } from '../http-status-code/http-status-code';

type AttributeValue = Exclude<PrimitiveValue, undefined>;

export function SpanAttributeValue({
  size = 'xs',
  attr,
  value,
  context = 'spans',
  classifier = AttributeClassifier,
  onClick,
  trailingAction,
}: {
  size?: MantineSize;
  attr: string;
  value?: PrimitiveValue;
  context?: AttributeContext;
  classifier?: typeof AttributeClassifier;
  onClick?: ({ attr, val }: { attr: string; val: AttributeValue }) => void;
  trailingAction?: ReactNode;
}) {
  if (value === undefined) {
    return (
      <Text size={size} c="gray.6">
        —
      </Text>
    );
  }

  const layout = classifier.classify({ name: attr, context });
  const handleClick = onClick ?? (() => undefined);

  if (layout === 'duration') {
    const duration = typeof value === 'number' ? value : Number(value);
    const display = typeof value === 'string' ? value : String(duration);
    const color = getDurationColor({ durationMs: duration });
    return (
      <Badge color={color} variant="light" size={size}>
        {display} ms
      </Badge>
    );
  }
  if (layout === 'httpMethod') {
    return (
      <HttpMethodValue
        onClick={({ v }) =>
          handleClick({ attr: camelCase(HTTP_METHOD), val: v })
        }
        val={value as string}
      />
    );
  }
  if (layout === 'dbSystem') {
    return (
      <DbSystemName
        val={value as string}
        onClick={({ v }) =>
          handleClick({ attr: camelCase(DB_SYSTEM_NAME), val: v })
        }
      />
    );
  }
  if (layout === 'dbOperation') {
    return (
      <DbOperationName
        val={value as string}
        onClick={(v) =>
          handleClick({ attr: camelCase(DB_OPERATION_NAME), val: v })
        }
      />
    );
  }
  if (layout === 'httpStatusCode') {
    return (
      <HttpStatusCode
        val={value as number}
        onClick={(v) =>
          handleClick({ attr: camelCase(HTTP_STATUS_CODE), val: v })
        }
      />
    );
  }
  if (layout === 'identifier') {
    const identifier = (
      <Anchor
        size={size}
        c={attr === camelCase(TRACE_ID) ? 'gray.8' : 'gray.7'}
        fw={attr === camelCase(TRACE_ID) ? 'bold' : undefined}
        onClick={(event) => {
          event.preventDefault();
          handleClick({ attr, val: value });
        }}
      >
        {String(value)}
      </Anchor>
    );
    return trailingAction ? (
      <Group gap={4} wrap="nowrap">
        {identifier}
        {trailingAction}
      </Group>
    ) : identifier;
  }
  if (layout === 'service') {
    return (
      <Badge
        variant="light"
        size={size}
        tt="none"
        color={getHashSelectedColor({ val: value as string })}
        autoContrast
        style={{ cursor: 'pointer' }}
        onClick={(event) => {
          event.preventDefault();
          handleClick({ attr, val: value });
        }}
      >
        {String(value)}
      </Badge>
    );
  }
  if (layout === 'severity') {
    return (
      <Badge size={size} variant="light" color={severityColor(value)}>
        {String(value)}
      </Badge>
    );
  }
  if (layout === 'timestamp' || layout === 'body') {
    return (
      <Text
        size={size}
        style={layout === 'body' ? { whiteSpace: 'pre-wrap' } : undefined}
      >
        {String(value)}
      </Text>
    );
  }

  return (
    <Anchor
      size={size}
      onClick={(event) => {
        event.preventDefault();
        handleClick({ attr, val: value });
      }}
    >
      {String(value)}
    </Anchor>
  );
}

function severityColor(value: AttributeValue) {
  if (typeof value === 'number') {
    if (value >= 21) return 'red';
    if (value >= 17) return 'orange';
    if (value >= 13) return 'yellow';
    if (value >= 9) return 'blue';
    return 'gray';
  }

  const normalized = String(value).toLowerCase();
  if (normalized === 'fatal' || normalized === 'error') return 'red';
  if (normalized === 'warn' || normalized === 'warning') return 'orange';
  if (normalized === 'info') return 'blue';
  return 'gray';
}
