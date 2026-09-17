import { AttributeLabel } from '@/components/attribute-label';
import { DbSystemIcon } from '@/components/db-system-icon/db-system-icon';
import { SpanAttributeValue } from '@/components/span-attribute-value/span-attribute-value';
import { SpanRowV2 } from '@/lib/response-types';
import {
  DB_COLLECTION_NAME,
  DB_OPERATION_NAME,
  DB_QUERY_SUMMARY,
  DB_QUERY_TEXT,
  DB_RESPONSE_RETURNED_ROWS,
  DB_RESPONSE_STATUS_CODE,
  DB_SYSTEM_NAME,
  getSpanAttributeLabel,
} from '@/lib/span-attributes';
import { Group, Stack, Text } from '@mantine/core';
import { camelCase } from 'lodash';

export function DbAttributesView({ row }: { row: SpanRowV2 }) {
  const hasAny =
    row.dbSystemName ||
    row.dbCollectionName ||
    row.dbResponseStatusCode ||
    row.dbOperationName ||
    row.dbQuerySummary ||
    row.dbQueryText ||
    row.dbResponseReturnedRows !== undefined;

  if (!hasAny) return null;

  const noOp = () => {};
  const systemName = row.dbSystemName;
  const collectionName = row.dbCollectionName;

  return (
    <Stack gap="xs">
      <Group gap="xs" align="center">
        {systemName ? <DbSystemIcon systemName={systemName} /> : null}
        {systemName ? (
          <>
            <AttributeLabel label={getSpanAttributeLabel(DB_SYSTEM_NAME)} />
            <SpanAttributeValue
              attr={camelCase(DB_SYSTEM_NAME)}
              value={systemName}
              onClick={noOp}
            />
          </>
        ) : null}
        {systemName && collectionName ? (
          <Text size="xs" c="gray.6">
            /
          </Text>
        ) : null}
        {collectionName ? (
          <>
            <AttributeLabel label={getSpanAttributeLabel(DB_COLLECTION_NAME)} />
            <SpanAttributeValue
              attr={camelCase(DB_COLLECTION_NAME)}
              value={collectionName}
              onClick={noOp}
            />
          </>
        ) : null}
        {row.dbResponseStatusCode !== undefined ? (
          <>
            <AttributeLabel
              label={getSpanAttributeLabel(DB_RESPONSE_STATUS_CODE)}
            />
            <SpanAttributeValue
              attr={camelCase(DB_RESPONSE_STATUS_CODE)}
              value={row.dbResponseStatusCode}
              onClick={noOp}
            />
          </>
        ) : null}
      </Group>
      <Group gap="xs" align="center">
        {row.dbOperationName ? (
          <>
            <AttributeLabel label={getSpanAttributeLabel(DB_OPERATION_NAME)} />
            <SpanAttributeValue
              attr={camelCase(DB_OPERATION_NAME)}
              value={row.dbOperationName}
              onClick={noOp}
            />
          </>
        ) : null}
        {row.dbQuerySummary ? (
          <>
            <AttributeLabel label={getSpanAttributeLabel(DB_QUERY_SUMMARY)} />
            <SpanAttributeValue
              attr={camelCase(DB_QUERY_SUMMARY)}
              value={row.dbQuerySummary}
              onClick={noOp}
            />
          </>
        ) : null}
      </Group>
      {row.dbQueryText ? (
        <Group gap="xs" align="center">
          <AttributeLabel label={getSpanAttributeLabel(DB_QUERY_TEXT)} />
          <SpanAttributeValue
            attr={camelCase(DB_QUERY_TEXT)}
            value={row.dbQueryText}
            onClick={noOp}
          />
        </Group>
      ) : null}
      <Group gap={6} align="center">
        {row.dbResponseReturnedRows !== undefined ? (
          <>
            <AttributeLabel label="returned" />
            <SpanAttributeValue
              attr={camelCase(DB_RESPONSE_RETURNED_ROWS)}
              value={row.dbResponseReturnedRows}
              onClick={noOp}
            />
            <Text size="xs" c="gray.7">
              rows
            </Text>
          </>
        ) : (
          <Text size="xs" c="gray.7">
            Unknown number of returned lines
          </Text>
        )}
      </Group>
    </Stack>
  );
}
