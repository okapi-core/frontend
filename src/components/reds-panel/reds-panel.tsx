import { RedMetrics } from '@/lib/response-types';
import { SimpleGrid, Stack } from '@mantine/core';
import { DurationsPanel } from '../durations-panel/durations-panel';
import { ErrorsPanel } from '../errors-panel/errors-panel';
import { RatesPanel } from '../rates-panel/rates-panel';
function getPanelTitle(
  op: string,
  facet: 'requests' | 'rps' | 'rpm' | 'errors' | 'error-rate' | 'duration',
) {
  if (facet === 'requests') return 'Requests - ' + op;
  if (facet === 'rps') return 'RPS - ' + op;
  if (facet === 'rpm') return 'RPM - ' + op;
  if (facet === 'errors') return 'Errors - ' + op;
  if (facet === 'error-rate') return 'Error rate - ' + op;
  return 'Duration - ' + op;
}

export function RedsPanel({
  operation,
  redMetrics,
  h,
  w,
  layout = 'h',
}: {
  operation: string;
  redMetrics: RedMetrics;
  h?: number | string;
  w?: number | string;
  layout?: 'h' | 'v';
}) {
  const ts = redMetrics.ts ?? [];
  const requests = redMetrics.counts ?? [];
  const rps = redMetrics.rps ?? [];
  const rpm = redMetrics.rpm ?? [];
  const errors = redMetrics.errors ?? [];
  const errorRates = redMetrics.errorRates ?? [];
  const p50 = redMetrics.durationsP50 ?? [];
  const p75 = redMetrics.durationsP75 ?? [];
  const p90 = redMetrics.durationsP90 ?? [];
  const p99 = redMetrics.durationsP99 ?? [];
  const panelHeight = h ?? 240;
  const panelWidth = w ?? '100%';
  const components = (
    <>
      <RatesPanel
        rates={requests}
        ts={ts}
        label={getPanelTitle(operation, 'requests')}
        seriesName="requests"
        height={panelHeight}
        width={panelWidth}
      />
      <RatesPanel
        rates={rps}
        ts={ts}
        label={getPanelTitle(operation, 'rps')}
        seriesName="rps"
        height={panelHeight}
        width={panelWidth}
      />
      <RatesPanel
        rates={rpm}
        ts={ts}
        label={getPanelTitle(operation, 'rpm')}
        seriesName="rpm"
        height={panelHeight}
        width={panelWidth}
      />
      <ErrorsPanel
        rates={errors}
        ts={ts}
        label={getPanelTitle(operation, 'errors')}
        seriesName="errors"
        height={panelHeight}
        width={panelWidth}
      />
      <ErrorsPanel
        rates={errorRates}
        ts={ts}
        label={getPanelTitle(operation, 'error-rate')}
        seriesName="error rate"
        height={panelHeight}
        width={panelWidth}
      />
      <DurationsPanel
        p50={p50}
        p75={p75}
        p90={p90}
        p99={p99}
        ts={ts}
        label={getPanelTitle(operation, 'duration')}
        height={panelHeight}
        width={panelWidth}
      />
    </>
  );
  if (layout === 'h') {
    return (
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {components}
      </SimpleGrid>
    );
  }
  return <Stack>{components}</Stack>;
}
