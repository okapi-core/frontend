import { AttributeLabel } from '@/components/attribute-label';
import { SpanAttributeValue } from '@/components/span-attribute-value/span-attribute-value';
import { SpanRowV2 } from '@/lib/response-types';
import {
  HTTP_HOST,
  HTTP_METHOD,
  HTTP_REQUEST_SIZE,
  HTTP_RESPONSE_SIZE,
  HTTP_STATUS_CODE,
  getSpanAttributeLabel,
} from '@/lib/span-attributes';
import { Group, Stack } from '@mantine/core';
import { camelCase } from 'lodash';

export function HttpAttribsView({ row }: { row: SpanRowV2 }) {
  function noOp() {}
  if (
    !row.httpHost &&
    !row.httpMethod &&
    !row.httpStatusCode &&
    row.httpRequestSize === undefined &&
    row.httpResponseSize === undefined
  ) {
    return <></>;
  }
  return (
    <Stack gap="xs">
      {row.httpMethod ? (
        <Group gap="xs" align="center">
          <AttributeLabel label={getSpanAttributeLabel(HTTP_METHOD)} />
          <SpanAttributeValue
            attr={camelCase(HTTP_METHOD)}
            value={row.httpMethod}
            onClick={noOp}
          />
        </Group>
      ) : null}
      {row.httpHost ? (
        <Group gap="xs" align="center">
          <AttributeLabel label={getSpanAttributeLabel(HTTP_HOST)} />
          <SpanAttributeValue
            attr={camelCase(HTTP_HOST)}
            value={row.httpHost}
            onClick={noOp}
          />
        </Group>
      ) : null}
      {row.httpStatusCode !== undefined ? (
        <Group gap="xs" align="center">
          <AttributeLabel label={getSpanAttributeLabel(HTTP_STATUS_CODE)} />
          <SpanAttributeValue
            attr={camelCase(HTTP_STATUS_CODE)}
            value={row.httpStatusCode}
            onClick={noOp}
          />
        </Group>
      ) : null}
      {row.httpRequestSize !== undefined ? (
        <Group gap="xs" align="center">
          <AttributeLabel label={getSpanAttributeLabel(HTTP_REQUEST_SIZE)} />
          <SpanAttributeValue
            attr={camelCase(HTTP_REQUEST_SIZE)}
            value={row.httpRequestSize}
            onClick={noOp}
          />
        </Group>
      ) : null}
      {row.httpResponseSize !== undefined ? (
        <Group gap="xs" align="center">
          <AttributeLabel label={getSpanAttributeLabel(HTTP_RESPONSE_SIZE)} />
          <SpanAttributeValue
            attr={camelCase(HTTP_RESPONSE_SIZE)}
            value={row.httpResponseSize}
            onClick={noOp}
          />
        </Group>
      ) : null}
    </Stack>
  );
}
