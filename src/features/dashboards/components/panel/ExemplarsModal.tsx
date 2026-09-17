'use client';

import { SpanAttributeValue } from '@/components/span-attribute-value/span-attribute-value';
import { MeasurementValue } from '@/components/measurement-value/measurement-value';
import { TraceViewNav } from '@/components/trace-view-nav';
import { queryMetricExemplars } from '@/lib/api';
import { checkIfRequestFailed } from '@/lib/api-responses';
import { QueryConfig } from '@/lib/request-types';
import { Exemplar } from '@/lib/response-types';
import { Code, Group, Loader, Modal, Stack, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import DataTable, { TableColumn } from 'react-data-table-component';
import { useMemo } from 'react';

export interface ExemplarsModalProps {
  opened: boolean;
  onClose: () => void;
  metricPaths: string[];
  timeConstraint: { startMs: number; endMs: number };
}

export function ExemplarsModal({
  opened,
  onClose,
  metricPaths,
  timeConstraint,
}: ExemplarsModalProps) {
  const paths = useMemo(
    () => [...new Set(metricPaths.map((path) => path.trim()).filter(Boolean))],
    [metricPaths],
  );

  const exemplarQuery = useQuery({
    queryKey: [
      'metric-exemplars',
      paths,
      timeConstraint.startMs,
      timeConstraint.endMs,
    ],
    queryFn: async () => {
      const queries: QueryConfig[] = paths.map((query) => ({ query }));
      const response = await queryMetricExemplars({
        multiQueryRequest: {
          grammar: 'OKAPI_JSON',
          queries,
          timeConstraint: {
            start: timeConstraint.startMs,
            end: timeConstraint.endMs,
          },
        },
      });
      if (checkIfRequestFailed(response)) {
        throw new Error(response.error || 'Failed to load exemplars');
      }
      return response.data?.responses || [];
    },
    enabled: opened && paths.length > 0,
  });

  const exemplars: ExemplarRow[] = (exemplarQuery.data || []).flatMap(
    (result, index) =>
      (result.exemplars || []).map((exemplar) => ({
        id: `${result.metric || paths[index]}-${exemplar.tsNanos || index}`,
        metric: result.metric || paths[index],
        exemplar,
      })),
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={700}>Exemplars</Text>}
      size="90%"
    >
      <Stack>
        {exemplarQuery.isLoading ? (
          <Group justify="center" py="xl">
            <Loader size="sm" />
          </Group>
        ) : null}

        {!exemplarQuery.isLoading && !paths.length ? (
          <Text c="dimmed" size="sm">
            No metric paths available.
          </Text>
        ) : null}

        {exemplarQuery.isError ? (
          <Text c="red" size="sm">
            Failed to load exemplars.
          </Text>
        ) : null}

        {!exemplarQuery.isLoading &&
        paths.length > 0 &&
        exemplars.length === 0 &&
        !exemplarQuery.isError ? (
          <Text c="dimmed" size="sm">
            No exemplars found for this time range.
          </Text>
        ) : null}

        {exemplars.length ? (
          <DataTable
            columns={exemplarColumns}
            data={exemplars}
            keyField="id"
            dense
            highlightOnHover
            pagination
            responsive
            fixedHeader
            fixedHeaderScrollHeight="480px"
            resizable
            customStyles={{
              table: { style: { minWidth: '1000px' } },
            }}
          />
        ) : null}
      </Stack>
    </Modal>
  );
}

type ExemplarRow = {
  id: string;
  metric: string;
  exemplar: Exemplar;
};

const exemplarColumns: TableColumn<ExemplarRow>[] = [
  {
    name: 'metric',
    selector: (row) => row.exemplar.metric || row.metric,
    sortable: true,
    wrap: true,
  },
  {
    name: 'tsNanos',
    selector: (row) => row.exemplar.tsNanos || 0,
    format: (row) =>
      row.exemplar.tsNanos
        ? new Date(row.exemplar.tsNanos / 1_000_000).toLocaleString()
        : '—',
    sortable: true,
  },
  {
    name: 'tags',
    cell: (row) => (
      <Code block>{row.exemplar.tags ? JSON.stringify(row.exemplar.tags) : '—'}</Code>
    ),
    wrap: true,
  },
  {
    name: 'measurement',
    cell: (row) => <MeasurementValue value={row.exemplar.measurement} />,
  },
  {
    name: 'traceId',
    cell: (row) => (
      <SpanAttributeValue
        attr="traceId"
        value={row.exemplar.traceId}
        trailingAction={<TraceViewNav traceId={row.exemplar.traceId} />}
      />
    ),
    wrap: true,
  },
  {
    name: 'spanId',
    cell: (row) => (
      <SpanAttributeValue
        attr="spanId"
        value={row.exemplar.spanId}
      />
    ),
    wrap: true,
  },
];

export default ExemplarsModal;
