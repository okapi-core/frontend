import {
  CounterRenderer,
  GaugeRenderer,
  HistogramRenderer,
} from '@/features/dashboards/components/panel/PanelContentSwitch';
import { fetchMetrics } from '@/lib/domain/metrics';
import { GetMetricsRequest } from '@/lib/request-types';
import { GetMetricsResponse } from '@/lib/response-types';
import { Button, Group, Text } from '@mantine/core';
import { BarChartIcon } from 'lucide-react';
import { useState } from 'react';
import { useOscarChatStore } from '../store';

function parseMetricsRequest(content: string): GetMetricsRequest | null {
  try {
    return JSON.parse(content) as GetMetricsRequest;
  } catch {
    return null;
  }
}

export function PlotMetricAction({
  request,
  label,
}: {
  request: GetMetricsRequest;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<GetMetricsResponse | null>(null);
  const setSidebarData = useOscarChatStore((s) => s.setSidebarData);
  const setShowSideBar = useOscarChatStore((s) => s.setShowSideBar);

  async function handleClick() {
    setLoading(true);
    try {
      const result = await fetchMetrics(request);
      if (result.data) {
        setSidebarData({ type: 'metrics', query: result.data });
        setShowSideBar(true);
        setResponse(result.data);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Group gap="xs" align="stretch">
      <Button
        size="xs"
        variant="light"
        color="teal"
        leftSection={<BarChartIcon size={14} />}
        loading={loading}
        onClick={handleClick}
      >
        <Text size="xs">{label ?? `View metric: ${request.metric}`}</Text>
      </Button>
    </Group>
  );
}

export function PlotCmdAction({ content }: { content: string }) {
  const request = parseMetricsRequest(content);
  if (!request) return null;
  return <PlotMetricAction request={request} />;
}

function MetricPlot({ response }: { response: GetMetricsResponse }) {
  const responses = [response];
  const hasGauge = !!response.gaugeResponse?.series?.length;
  const hasHisto = !!response.histogramResponse?.series?.length;
  const hasCounter = !!response.sumsResponse?.sums?.length;

  if (hasGauge && !hasHisto && !hasCounter) {
    return (
      <div style={{ height: 400 }}>
        <GaugeRenderer res={responses} />
      </div>
    );
  }
  if (hasHisto && !hasCounter) {
    return (
      <div style={{ height: 400 }}>
        <HistogramRenderer res={responses} />
      </div>
    );
  }
  if (hasCounter && !hasHisto) {
    return (
      <div style={{ height: 400 }}>
        <CounterRenderer res={responses} />
      </div>
    );
  }
  return null;
}
