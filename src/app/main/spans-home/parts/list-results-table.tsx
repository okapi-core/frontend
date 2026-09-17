import { MultiSelectMenu } from '@/components/multi-select-menu/multi-select-menu';
import { SpanAttributeValue } from '@/components/span-attribute-value/span-attribute-value';
import { TraceViewNav } from '@/components/trace-view-nav';
import { AttributeClassifier } from '@/lib/attribute-classifier';
import {
  milliDurationBetweenNs,
  nanosToHuman,
  truncateToN,
} from '@/lib/date-conversions';
import { SpanRowV2 } from '@/lib/response-types';
import {
  DB_COLLECTION_NAME,
  DB_NAMESPACE,
  DB_OPERATION_NAME,
  DB_SYSTEM_NAME,
  HTTP_HOST,
  HTTP_METHOD,
  HTTP_ORIGIN,
  HTTP_STATUS_CODE,
  isDefaultSpanAttribute,
  RPC_METHOD,
  SERVICE_NAME,
  SERVICE_PEER_NAME,
  SPAN_ID,
  SPAN_KIND,
  TRACE_ID,
} from '@/lib/span-attributes';
import { Anchor, Group, Stack, Text } from '@mantine/core';
import { camelCase, keys, snakeCase, uniq } from 'lodash';
import { useState } from 'react';
import DataTable, { TableColumn } from 'react-data-table-component';
import { useSpansHomeStore } from '../store';

const SPAN_COLUMNS = [
  camelCase(TRACE_ID),
  camelCase(SPAN_ID),
  'tsStartNs',
  'tsEndNs',
  'durationMillis',
  'kind',
  camelCase(SERVICE_NAME),
  'servicePeerName',
  camelCase(HTTP_METHOD),
  camelCase(HTTP_STATUS_CODE),
  camelCase(HTTP_HOST),
  camelCase(DB_SYSTEM_NAME),
  camelCase(DB_OPERATION_NAME),
  camelCase(RPC_METHOD),
];

const DEFAULT_COLUMNS = [
  'traceId',
  'spanId',
  'tsStartNs',
  'tsEndNs',
  'durationMillis',
  'kind',
  'serviceName',
  'httpMethod',
  'httpStatusCode',
];

export function ListResultsTable({
  items,
  onSpanSelect,
}: {
  items: SpanRowV2[];
  onSpanSelect?: (row: SpanRowV2) => void;
}) {
  const customColumns = uniq(
    items
      .map((row) => [
        ...keys(row.customStringAttributes),
        ...keys(row.customNumberAttributes),
      ])
      .flat(),
  );
  const allColumns = uniq([...SPAN_COLUMNS, ...customColumns]);
  const [selectedColumns, setSelectedColumns] =
    useState<string[]>(DEFAULT_COLUMNS);
  const visibleColumns = allColumns.filter((column) =>
    selectedColumns.includes(column),
  );

  const setAttribute = useSpansHomeStore((state) => state.setAttribute);
  const stringAttributes = useSpansHomeStore((state) => state.stringAttributes);
  const numberAttributes = useSpansHomeStore((state) => state.numberAttributes);

  const handleValueClick = ({
    row,
    attr,
    val,
  }: {
    row: SpanRowV2;
    attr: string;
    val: string | number | boolean;
  }) => {
    if (isDefaultSpanAttribute(attr)) {
      const attrAsSnakeCase = snakeCase(attr);
      const normalized = String(val);
      if (attrAsSnakeCase === TRACE_ID) setAttribute('traceId', normalized);
      else if (attrAsSnakeCase === SPAN_ID) {
        if (onSpanSelect) onSpanSelect(row);
        else setAttribute('fullViewRows', row);
      } else if (attrAsSnakeCase === SPAN_KIND)
        setAttribute('spanKind', normalized);
      else if (attrAsSnakeCase === SERVICE_NAME)
        setAttribute('serviceName', normalized);
      else if (attrAsSnakeCase === SERVICE_PEER_NAME)
        setAttribute('servicePeer', normalized);
      else if (attrAsSnakeCase === HTTP_METHOD)
        setAttribute('httpMethod', normalized);
      else if (attrAsSnakeCase === HTTP_STATUS_CODE)
        setAttribute('httpStatusCode', normalized);
      else if (attrAsSnakeCase === HTTP_ORIGIN)
        setAttribute('httpOrigin', normalized);
      else if (attrAsSnakeCase === HTTP_HOST)
        setAttribute('httpHost', normalized);
      else if (attrAsSnakeCase === DB_SYSTEM_NAME)
        setAttribute('dbSystem', normalized);
      else if (attrAsSnakeCase === DB_COLLECTION_NAME)
        setAttribute('dbCollection', normalized);
      else if (attrAsSnakeCase === DB_NAMESPACE)
        setAttribute('dbNamespace', normalized);
      else if (attrAsSnakeCase === DB_OPERATION_NAME)
        setAttribute('dbOperation', normalized);
      return;
    }

    const isNumber = typeof val === 'number';
    if (isNumber) {
      const next = upsertAttributeRow(numberAttributes, attr, String(val));
      setAttribute('numberAttributes', next);
    } else {
      const next = upsertAttributeRow(stringAttributes, attr, String(val));
      setAttribute('stringAttributes', next);
    }
  };

  const rdtColumns: TableColumn<SpanRowV2>[] = [
    ...visibleColumns.map((column) => ({
      id: column,
      name: column,
      sortable: true,
      minWidth: '100px',
      width: '200px',
      selector: (row: SpanRowV2) => getSpanValue(row, column) ?? '',
      cell: (row: SpanRowV2) => {
        const value = getSpanValue(row, column);
        if (value === undefined || value === null) {
          return (
            <Text size="xs" c="gray.6">
              —
            </Text>
          );
        }
        if (column === 'traceId') {
          return (
            <SpanAttributeValue
              attr={column}
              classifier={AttributeClassifier}
              value={value as string | number}
              trailingAction={<TraceViewNav traceId={row.traceId} />}
              onClick={({ attr, val }) => handleValueClick({ row, attr, val })}
            />
          );
        }
        return (
          <SpanAttributeValue
            attr={column}
            classifier={AttributeClassifier}
            value={value as string | number}
            onClick={({ attr, val }) => handleValueClick({ row, attr, val })}
          />
        );
      },
    })),
    {
      id: 'view',
      name: '',
      width: '80px',
      button: true,
      ignoreRowClick: true,
      cell: (row: SpanRowV2) => (
        <Anchor
          size="xs"
          c="blue.8"
          onClick={(event) => {
            event.preventDefault();
            if (onSpanSelect) onSpanSelect(row);
            else setAttribute('fullViewRows', row);
          }}
        >
          View
        </Anchor>
      ),
    },
  ];

  return (
    <Stack gap="md" align="stretch">
      <Group justify="flex-start">
        <MultiSelectMenu
          title="Columns"
          choices={allColumns.map((column) => ({
            value: column,
            label: column,
          }))}
          value={selectedColumns}
          onChange={setSelectedColumns}
          searchable
        />
      </Group>
      <DataTable
        columns={rdtColumns}
        data={items}
        noDataComponent="No spans found."
        highlightOnHover
        pagination
        dense
        responsive
        resizable
        onRowClicked={onSpanSelect}
      />
    </Stack>
  );
}

function getSpanValue(
  row: SpanRowV2,
  column: string,
): string | number | undefined {
  switch (column) {
    case 'traceId':
      return row.traceId;
    case 'spanId':
      return row.spanId;
    case 'tsStartNs':
      return row.tsStartNs ? nanosToHuman({ nanos: row.tsStartNs }) : undefined;
    case 'tsEndNs':
      return row.tsEndNs ? nanosToHuman({ nanos: row.tsEndNs }) : undefined;
    case 'durationMillis':
      return row.tsStartNs && row.tsEndNs
        ? truncateToN({
            value: milliDurationBetweenNs({
              startNs: row.tsStartNs,
              endNs: row.tsEndNs,
            }),
            places: 2,
          })
        : undefined;
    case 'kind':
      return row.kindString || row.kind;
    case 'serviceName':
      return row.serviceName;
    case 'servicePeerName':
      return row.servicePeerName;
    case 'httpMethod':
      return row.httpMethod;
    case 'httpStatusCode':
      return row.httpStatusCode;
    case 'httpHost':
      return row.httpHost;
    case 'dbSystemName':
      return row.dbSystemName;
    case 'dbOperationName':
      return row.dbOperationName;
    case 'rpcMethod':
      return row.rpcMethod;
    default:
      return (
        row.customStringAttributes?.[column] ??
        row.customNumberAttributes?.[column]
      );
  }
}

function upsertAttributeRow(
  rows: { key: string; value: string }[],
  key: string,
  value: string,
) {
  const existing = rows.find((row) => row.key === key);
  if (existing) {
    return rows.map((row) => (row.key === key ? { ...row, value } : row));
  }
  return [
    ...rows,
    {
      id: `${key}-${Date.now()}`,
      key,
      value,
    },
  ];
}
