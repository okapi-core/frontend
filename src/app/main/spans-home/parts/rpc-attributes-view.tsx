import { AttributeLabel } from '@/components/attribute-label';
import { SpanAttributeValue } from '@/components/span-attribute-value/span-attribute-value';
import { SpanRowV2 } from '@/lib/response-types';
import {
  getSpanAttributeLabel,
  RPC_METHOD,
  RPC_METHOD_ORIGINAL,
  RPC_RESPONSE_STATUS_CODE,
} from '@/lib/span-attributes';
import { Group, Stack } from '@mantine/core';
import { camelCase } from 'lodash';

export function RpcAttributesView({ row }: { row: SpanRowV2 }) {
  if (!row.rpcMethod && !row.rpcMethodOriginal && !row.rpcResponseStatusCode) {
    return null;
  }

  const noOp = () => {};

  return (
    <Stack gap="xs">
      {row.rpcMethod ? (
        <Group gap="xs" align="center">
          <AttributeLabel label={getSpanAttributeLabel(RPC_METHOD)} />
          <SpanAttributeValue
            attr={camelCase(RPC_METHOD)}
            value={row.rpcMethod}
            onClick={noOp}
          />
        </Group>
      ) : null}
      {row.rpcMethodOriginal ? (
        <Group gap="xs" align="center">
          <AttributeLabel label={getSpanAttributeLabel(RPC_METHOD_ORIGINAL)} />
          <SpanAttributeValue
            attr={camelCase(RPC_METHOD_ORIGINAL)}
            value={row.rpcMethodOriginal}
            onClick={noOp}
          />
        </Group>
      ) : null}
      {row.rpcResponseStatusCode !== undefined ? (
        <Group gap="xs" align="center">
          <AttributeLabel
            label={getSpanAttributeLabel(RPC_RESPONSE_STATUS_CODE)}
          />
          <SpanAttributeValue
            attr={camelCase(RPC_RESPONSE_STATUS_CODE)}
            value={row.rpcResponseStatusCode}
            onClick={noOp}
          />
        </Group>
      ) : null}
    </Stack>
  );
}
