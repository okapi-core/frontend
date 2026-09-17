import { MultiSelectMenu } from '@/components/multi-select-menu/multi-select-menu';
import { SpanAttributeValue } from '@/components/span-attribute-value/span-attribute-value';
import { TraceViewNav } from '@/components/trace-view-nav';
import { AttributeClassifier } from '@/lib/attribute-classifier';
import { nanosToHuman } from '@/lib/date-conversions';
import { ChLogRow } from '@/lib/response-types';
import type { PrimitiveValue } from '@/lib/types';
import { extractUnionValue } from '@/lib/union-values';
import { Group, LoadingOverlay } from '@mantine/core';
import { keys, uniq } from 'lodash';
import DataTable, {
  TableColumn,
  useColumnVisibility,
} from 'react-data-table-component';
import { useStoreProp } from './store';

// todo: use RDT for spans as well, remove your shitty table.

const LOG_ATTRIBS: (keyof ChLogRow)[] = [
  'tsNanos',
  'logStream',
  'serviceName',
  'logLevel',
  'severityText',
  'traceId',
  'spanId',
  'body',
];

export function LogsResults() {
  const status = useStoreProp('searchStatus');
  const res = useStoreProp('logsSearchResult');

  const attributeCols = uniq(
    res?.items?.map((row) => keys(row.attributes)).flat() ?? [],
  );
  const allCols: string[] = uniq([...LOG_ATTRIBS, ...attributeCols]);

  const rdtCols: TableColumn<ChLogRow>[] = allCols.map((col) => ({
    id: col,
    name: col,
    sortable: true,
    reorder: true,
    right: true,
    minWidth: '100px',
    width: '200px',
    selector: (row: ChLogRow) => getLogValue(row, col) ?? '',
    cell: (row: ChLogRow) => {
      const isTrace = col === 'traceId' && row.traceId;
      if (isTrace) {
        return (
          <SpanAttributeValue
            attr={col}
            context="logs"
            classifier={AttributeClassifier}
            value={getLogValue(row, col)}
            trailingAction={<TraceViewNav traceId={row.traceId} />}
          />
        );
      }
      return (
        <SpanAttributeValue
          attr={col}
          context="logs"
          classifier={AttributeClassifier}
          value={getLogValue(row, col)}
        />
      );
    },
  }));
  const { columns, entries, toggleColumn, showAll } =
    useColumnVisibility(rdtCols);

  if (status === 'pending') {
    return <LoadingOverlay></LoadingOverlay>;
  }

  const selectedColumns = entries
    .filter((entry) => entry.visible)
    .map((entry) => String(entry.column.id));
  const handleColumnChange = (next: string[]) => {
    if (next.length === allCols.length) {
      showAll();
      return;
    }

    const nextSet = new Set(next);
    entries.forEach((entry) => {
      const id = String(entry.column.id);
      if (entry.visible !== nextSet.has(id)) {
        toggleColumn(entry.column.id!);
      }
    });
  };

  return (
    <>
      <Group justify="flex-start">
        <MultiSelectMenu
          title="Columns"
          choices={allCols.map((column) => ({
            value: column,
            label: column,
          }))}
          value={selectedColumns}
          onChange={handleColumnChange}
          searchable
        />
      </Group>
      <DataTable
        columns={columns}
        data={res?.items ?? []}
        noDataComponent="No logs found."
        highlightOnHover
        pagination
        dense
        responsive
        resizable
      />
    </>
  );
}

function getLogValue(row: ChLogRow, column: string): PrimitiveValue {
  if (LOG_ATTRIBS.includes(column as keyof ChLogRow)) {
    const attribute = column as keyof ChLogRow;
    if (attribute === 'tsNanos') return nanosToHuman({ nanos: row.tsNanos });
    return row[attribute] as PrimitiveValue;
  }
  return extractUnionValue(row.attributes?.[column]);
}
