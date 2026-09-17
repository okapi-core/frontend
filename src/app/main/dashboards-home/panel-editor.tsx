'use client';
import TimeRangePicker from '@/components/custom-component-tray/time-range-picker';
import { GridBoard } from '@/components/grid/GridBoard';
import { PageCanvas } from '@/components/page-canvas';
import { DashboardPanelRenderer } from '@/features/dashboards/components/PanelRenderer';
import { VarValueSelector } from '@/features/dashboards/components/vars-ctx/var-selector';
import { useRunQuerySnapshot } from '@/features/dashboards/hooks/useRunQuerySnapshot';
import { useAppServices } from '@/lib/app-services';
import { useUserData } from '@/lib/context';
import { useDashboardViewApi } from '@/lib/domain/dashboard-view';
import {
  useMetricHintsQuery,
  useTagHintsQuery,
  useTagValueHintsQuery,
} from '@/lib/domain/metrics';
import { usePanelEditorApi } from '@/lib/domain/panels';
import { translateError } from '@/lib/error-translator';
import { parseWithoutFail } from '@/lib/parsing';
import {
  AGG_TYPE,
  GaugeQueryConfig,
  GetMetricsRequest,
  GetSumsQueryConfig,
  HistoQueryConfig,
  METRIC_TYPE,
  QueryConfig,
  RES_TYPE,
  TEMPORALITY,
} from '@/lib/request-types';
import { MAIN_DASH_EDIT_PATH } from '@/lib/routing';
import { formatUrlPath, orBlank, orElse } from '@/lib/strings-common';
import {
  ActionIcon,
  Autocomplete,
  Button,
  Collapse,
  Combobox,
  Divider,
  Group,
  InputWrapper,
  Paper,
  Popover,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
  useCombobox,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import {
  ArrowLeft,
  BarChart3,
  ChevronDown,
  Gauge,
  Hash,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

export const DEFAULT_GET_METRICS_OBJ: GetMetricsRequest = {
  metricType: 'GAUGE',
  metric: '',
  start: 0,
  end: 0,
  gaugeQueryConfig: {
    resolution: 'SECONDLY',
    aggregation: 'AVG',
  },
};
export const DEFAULT_GET_METRICS = JSON.stringify(DEFAULT_GET_METRICS_OBJ);
const RESOLUTION_OPTIONS: { value: RES_TYPE; label: string }[] = [
  { value: 'SECONDLY', label: 'secondly' },
  { value: 'MINUTELY', label: 'minutely' },
  { value: 'HOURLY', label: 'hourly' },
];
const AGGREGATION_OPTIONS: { value: AGG_TYPE; label: string }[] = [
  { value: 'AVG', label: 'avg' },
  { value: 'SUM', label: 'sum' },
  { value: 'MIN', label: 'min' },
  { value: 'MAX', label: 'max' },
  { value: 'COUNT', label: 'count' },
  { value: 'P50', label: 'p50' },
  { value: 'P75', label: 'p75' },
  { value: 'P90', label: 'p90' },
  { value: 'P95', label: 'p95' },
  { value: 'P99', label: 'p99' },
];
const TEMPORALITY_OPTIONS: { value: TEMPORALITY; label: string }[] = [
  { value: 'DELTA', label: 'delta' },
  { value: 'CUMULATIVE', label: 'cumulative' },
];

export default function PanelEditorPage() {
  const { currentOrg } = useUserData();
  const { slug, dashVersion } = useParams<{
    slug: string;
    dashVersion: string;
  }>();
  const dashboardSlug = slug || '';
  const dashboardVersion = dashVersion || '';

  return (
    <PageCanvas
      path={[
        { label: 'Dashboards', href: '/main/dashboards' },
        {
          label: 'Dashboard',
          href: `/main/dashboards/${dashboardSlug}/${dashboardVersion}`,
        },
        {
          label: 'Row',
          href: `/main/dashboards/${dashboardSlug}/${dashboardVersion}/edit`,
        },
        { label: 'Panel', href: '#' },
      ]}
      inner={<InnerPanelEditorPage />}
      sidebarProps={{
        org: currentOrg,
        activeItem: 'playground',
      }}
    />
  );
}

export function SaveDashboardComponent({
  dashboardSlug,
  version,
  rowSlug,
  panelSlug,
  title,
  description,
  queryConfig,
}: {
  dashboardSlug: string;
  version?: string;
  rowSlug: string;
  panelSlug: string;
  title: string;
  description: string;
  queryConfig: QueryConfig[];
}) {
  const panelApi = usePanelEditorApi({
    dashboardId: dashboardSlug,
    versionId: orBlank(version),
    rowId: rowSlug,
    panelId: panelSlug,
  });
  const { notify } = useAppServices();
  return (
    <Button
      size="xs"
      leftSection={<Plus />}
      w={'fit-content'}
      onClick={() => {
        panelApi
          .savePanel({
            title: title,
            note: description,
            grammar: 'OKAPI_JSON',
            queryConfig,
          })
          .then((d) => {
            const err = translateError(d);
            if (err.error) {
              notify.error(`Failed to save panel: ${err.error}`);
              return;
            }
            notify.success('Panel saved');
          })
          .catch((err) => {
            notify.error(
              err instanceof Error ? err.message : 'Failed to save panel',
            );
          });
      }}
      loading={panelApi.savePanelPending}
    >
      Save panel
    </Button>
  );
}
export function BackToEdit({
  dashboardSlug,
  version,
  target = 'edit',
}: {
  dashboardSlug: string;
  version?: string;
  target?: 'edit' | 'view';
}) {
  const { navigation } = useAppServices();
  return (
    <Button
      leftSection={<ArrowLeft />}
      variant="white"
      onClick={() => {
        const link =
          target === 'view'
            ? `/main/dashboards/${dashboardSlug}/${orBlank(version)}`
            : formatUrlPath(MAIN_DASH_EDIT_PATH, {
                slug: dashboardSlug,
                dashVersion: orBlank(version),
              });
        navigation.navigate(link);
      }}
    >
      {target === 'view' ? 'Back to dashboard' : 'Back to board'}
    </Button>
  );
}

export function InnerPanelEditorPage() {
  const { slug, rowId, panelId, dashVersion } = useParams<{
    slug: string;
    rowId: string;
    panelId: string;
    dashVersion: string;
  }>();
  const dashboardSlug = orBlank(slug);
  const rowSlug = orBlank(rowId);
  const panelSlug = orBlank(panelId);
  const panelApi = usePanelEditorApi({
    dashboardId: dashboardSlug,
    versionId: orBlank(dashVersion),
    rowId: rowSlug,
    panelId: panelSlug,
  });
  const dashboardApi = useDashboardViewApi({
    dashboardId: dashboardSlug,
    versionId: orBlank(dashVersion),
  });

  const [title, setTitle] = useState<string>('');
  const [queries, setQueries] = useState<QueryConfig[]>([]);
  const [startMs, setStartMs] = useState<number>(Date.now() - 60 * 60 * 1000);
  const [endMs, setEndMs] = useState<number>(Date.now());
  const [vars, setVars] = useState<{ [key: string]: string }>({});
  const previewState = useRunQuerySnapshot({
    queries,
    vars,
    startMs,
    endMs,
  });

  useEffect(() => {
    const p = panelApi.panelQuery.data?.data;
    if (!p) return;
    setTitle(orElse('Panel', p.title));
    setQueries(p.queries || []);
    if (!previewState.hasRun) {
      previewState.run({
        queries: p.queries || [],
        vars,
        startMs,
        endMs,
      });
    }
  }, [
    panelApi.panelQuery.data?.data?.panelId,
    previewState.hasRun,
    previewState.run,
  ]);

  const listVarsQuery = dashboardApi.varsQuery;
  const varSuggestions = useMemo(() => {
    const varsList = listVarsQuery.data?.data?.vars ?? [];
    return varsList
      .map((v) => (v.name ? `$__{${v.name}}` : ''))
      .filter(Boolean);
  }, [listVarsQuery.data?.data?.vars]);

  return (
    <Stack gap="md" p="md">
      <VarValueSelector
        vars={listVarsQuery.data?.data || { vars: [] }}
        ctx={vars}
        onChange={function (nextCtx: { [key: string]: string }): void {
          setVars(nextCtx);
        }}
      />
      <Divider />
      <Stack justify="space-between">
        <Group align="flex-end" justify="space-between">
          <InputWrapper w={'50%'} label="Panel Title" required size="sm">
            <TextInput
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Panel title"
            />
          </InputWrapper>
          <Group gap="sm">
            <BackToEdit {...{ dashboardSlug, version: dashVersion }} />
            <SaveDashboardComponent
              version={dashVersion}
              {...{
                dashboardSlug,
                rowSlug,
                panelSlug,
                title,
                description: '',
                queryConfig: queries,
              }}
            />
          </Group>
        </Group>
        <Group gap="sm" align="center">
          <TimeRangePicker
            value={{ startMs, endMs }}
            onChange={(v) => {
              setStartMs(v.startMs);
              setEndMs(v.endMs);
            }}
          />
          <Button size="xs" onClick={() => previewState.run()}>
            Refresh
          </Button>
        </Group>
      </Stack>

      <GridBoard
        config={{
          layout: [{ id: 'preview', x: 0, y: 0, w: 12, h: 13 }],
        }}
        items={{
          preview: previewState.snapshot ? (
            <DashboardPanelRenderer
              props={{
                panelId: panelSlug,
                title,
                queries: previewState.snapshot.queries,
              }}
              startMs={previewState.snapshot.startMs}
              endMs={previewState.snapshot.endMs}
              dashboardId={dashboardSlug}
              rowId={rowSlug}
              varsCtx={previewState.snapshot.vars}
              runKey={previewState.runKey}
            />
          ) : (
            <Paper
              withBorder
              radius="md"
              p="md"
              style={{ height: '100%', minHeight: 120 }}
            >
              <Text size="sm" c="dimmed">
                Run query to preview results.
              </Text>
            </Paper>
          ),
        }}
        cols={12}
        rowHeight={30}
        margin={[8, 8]}
        containerPadding={[8, 8]}
        draggable={false}
        resizable={true}
        compactType={null}
      />

      <Group justify="space-between" align="center">
        <Text fw={600}>Queries</Text>
        <Group>
          <Button size="xs" onClick={() => previewState.run()}>
            Run query
          </Button>

          <Button
            variant="default"
            onClick={() => {
              setQueries((prev) => [...prev, { query: DEFAULT_GET_METRICS }]);
            }}
          >
            Add Query
          </Button>
        </Group>
      </Group>

      <Stack gap="sm" style={{ maxHeight: '50vh', overflow: 'auto' }}>
        {queries.map((q, idx) => (
          <QueryEditor
            key={`q-${idx}`}
            idx={idx}
            query={q}
            startMs={startMs}
            endMs={endMs}
            varSuggestions={varSuggestions}
            onDelete={() =>
              setQueries((prev) => prev.filter((_, i) => i !== idx))
            }
            onChange={(next) => {
              let q = [...queries];
              q[idx] = next;
              setQueries(q);
            }}
          />
        ))}
      </Stack>
    </Stack>
  );
}

function DescriptionSection({
  description,
  onChange,
}: {
  description: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <Paper withBorder radius="md">
      <Button
        variant="subtle"
        fullWidth
        justify="space-between"
        rightSection={
          <ChevronDown
            size={16}
            style={{
              transform: `rotate(${open ? 0 : -90}deg)`,
              transition: 'transform 150ms ease',
            }}
          />
        }
        onClick={() => setOpen((v) => !v)}
      >
        Description
      </Button>
      <Collapse in={open}>
        <Stack p="sm" gap="xs">
          <Textarea
            id="panel-desc"
            value={description}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Describe this panel (optional)"
            minRows={2}
          />
        </Stack>
      </Collapse>
    </Paper>
  );
}

export function QueryEditor({
  idx,
  query,
  startMs,
  endMs,
  varSuggestions,
  onDelete,
  onChange,
}: {
  idx: number;
  query: QueryConfig;
  startMs: number;
  endMs: number;
  varSuggestions: string[];
  onDelete: () => void;
  onChange: (next: QueryConfig) => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <Paper withBorder radius="md">
      <Group justify="space-between" px="sm" py="xs" align="center">
        <Group
          gap="xs"
          onClick={() => setOpen((v) => !v)}
          style={{ cursor: 'pointer' }}
        >
          <ChevronDown
            size={16}
            style={{
              transform: `rotate(${open ? 0 : -90}deg)`,
              transition: 'transform 150ms ease',
            }}
          />
          <Text size="sm" c="dimmed">
            Query #{idx + 1}
          </Text>
        </Group>
        <ActionIcon
          variant="subtle"
          color="red"
          onClick={onDelete}
          aria-label="Delete query"
        >
          <Trash2 size={14} />
        </ActionIcon>
      </Group>
      <Collapse in={open}>
        <Stack p={'xs'}>
          <PanelQueryEditor
            query={query}
            onChange={onChange}
            startMs={startMs}
            endMs={endMs}
            varSuggestions={varSuggestions}
          />
        </Stack>
      </Collapse>
    </Paper>
  );
}

export function PanelQueryEditor({
  query,
  onChange,
  startMs,
  endMs,
  varSuggestions,
}: {
  query: QueryConfig;
  onChange: (next: QueryConfig) => void;
  startMs: number;
  endMs: number;
  varSuggestions: string[];
}) {
  const unmarshalled = parseWithoutFail<GetMetricsRequest>(
    query.query,
    DEFAULT_GET_METRICS_OBJ,
  );
  const metricType = unmarshalled.data.metricType;
  return (
    <Stack gap="sm">
      <Group align="flex-end">
        <TypeSelector
          value={metricType}
          onChange={(type) => {
            onChange({
              ...query,
              query: JSON.stringify({
                ...unmarshalled.data,
                metricType: type,
              } as GetMetricsRequest),
            });
          }}
        />
        {metricType === 'GAUGE' && (
          <GaugeConfigEditor
            conf={unmarshalled.data.gaugeQueryConfig ?? {}}
            onChange={(conf) => {
              onChange({
                ...query,
                query: JSON.stringify({
                  ...unmarshalled.data,
                  gaugeQueryConfig: conf,
                } as GetMetricsRequest),
              });
            }}
          />
        )}
        {metricType === 'HISTO' && (
          <HistoConfigEditor
            conf={unmarshalled.data.histoQueryConfig ?? {}}
            onChange={(conf) => {
              onChange({
                ...query,
                query: JSON.stringify({
                  ...unmarshalled.data,
                  histoQueryConfig: conf,
                } as GetMetricsRequest),
              });
            }}
          />
        )}
        {metricType === 'SUM' && (
          <SumsConfigEditor
            conf={unmarshalled.data.sumsQueryConfig ?? {}}
            onChange={(conf) => {
              onChange({
                ...query,
                query: JSON.stringify({
                  ...unmarshalled.data,
                  sumsQueryConfig: conf,
                } as GetMetricsRequest),
              });
            }}
          />
        )}
      </Group>
      <Group align="flex-end">
        <MetricsEditor
          metric={unmarshalled.data.metric}
          metricType={metricType}
          startMs={startMs}
          endMs={endMs}
          varSuggestions={varSuggestions}
          onUpdate={(metric) => {
            onChange({
              ...query,
              query: JSON.stringify({
                ...unmarshalled.data,
                metric,
              } as GetMetricsRequest),
            });
          }}
        />
        <TagsEditor
          tags={unmarshalled.data.tags}
          metric={unmarshalled.data.metric}
          metricType={metricType}
          startMs={startMs}
          endMs={endMs}
          varSuggestions={varSuggestions}
          onChange={(tags) => {
            onChange({
              ...query,
              query: JSON.stringify({
                ...unmarshalled.data,
                tags,
              } as GetMetricsRequest),
            });
          }}
        />
      </Group>
    </Stack>
  );
}

export function TypeSelector({
  value,
  onChange,
}: {
  value?: string;
  onChange: (next: string) => void;
}) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });
  const options = [
    { value: 'SUM', label: 'Counter', icon: Hash },
    { value: 'HISTO', label: 'Histogram', icon: BarChart3 },
    { value: 'GAUGE', label: 'Gauge', icon: Gauge },
  ];
  const selected =
    options.find((option) => option.value === value) ?? options[0];
  const SelectedIcon = selected.icon;

  return (
    <Stack gap="xs">
      <Title size={'xs'}>Type</Title>
      <Combobox
        store={combobox}
        onOptionSubmit={(next) => {
          onChange(next);
          combobox.closeDropdown();
        }}
      >
        <Combobox.Target>
          <Button
            variant="default"
            size="sm"
            onClick={() => combobox.toggleDropdown()}
            rightSection={<ChevronDown size={14} />}
            style={{ height: 36 }}
          >
            <Group gap="xs">
              <SelectedIcon size={14} />
              <Text size="sm">{selected.label}</Text>
            </Group>
          </Button>
        </Combobox.Target>
        <Combobox.Dropdown>
          <Combobox.Options>
            {options.map((option) => {
              const OptionIcon = option.icon;
              return (
                <Combobox.Option value={option.value} key={option.value}>
                  <Group gap="xs">
                    <OptionIcon size={14} />
                    <Text size="sm">{option.label}</Text>
                  </Group>
                </Combobox.Option>
              );
            })}
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
    </Stack>
  );
}

export function MetricsEditor({
  metric,
  metricType,
  startMs,
  endMs,
  varSuggestions = [],
  onUpdate,
}: {
  metric?: string;
  metricType?: METRIC_TYPE;
  startMs: number;
  endMs: number;
  varSuggestions?: string[];
  onUpdate: (next: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(metric || '');
  const [focused, setFocused] = useState(false);
  const [debouncedValue] = useDebouncedValue(value, 200);

  const metricHintsQuery = useMetricHintsQuery({
    metricPrefix: debouncedValue,
    metricType,
    startMs,
    endMs,
    enabled: focused,
  });

  useEffect(() => {
    if (metric !== undefined) {
      setValue(metric);
    }
  }, [metric]);

  const options = [
    ...new Set([...(metricHintsQuery.data ?? []), ...varSuggestions]),
  ];
  return (
    <Autocomplete
      data={options}
      ref={ref}
      value={value}
      size="sm"
      aria-label="Metric name"
      onFocus={() => setFocused(true)}
      onChange={(next) => {
        setValue(next);
        onUpdate(next);
      }}
    ></Autocomplete>
  );
}

export function TagsEditor({
  tags,
  metric,
  metricType,
  startMs,
  endMs,
  varSuggestions = [],
  onChange,
}: {
  tags?: { [k: string]: string };
  metric?: string;
  metricType?: METRIC_TYPE;
  startMs: number;
  endMs: number;
  varSuggestions?: string[];
  onChange: (next: { [k: string]: string }) => void;
}) {
  const [keyDraft, setKeyDraft] = useState('');
  const [valueDraft, setValueDraft] = useState('');
  const [keyFocused, setKeyFocused] = useState(false);
  const [valueFocused, setValueFocused] = useState(false);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const entries = Object.entries(tags ?? {});
  const localKeyOptions = entries.map(([key]) => key);
  const localValueOptions = entries.map(([, value]) => value);
  const [debouncedKey] = useDebouncedValue(keyDraft, 200);

  const tagHintsQuery = useTagHintsQuery({
    metric,
    metricType,
    startMs,
    endMs,
    tagPrefix: debouncedKey,
    otherTags: tags,
    enabled: keyFocused,
  });

  const tagValueHintsQuery = useTagValueHintsQuery({
    metric,
    metricType,
    startMs,
    endMs,
    tag: debouncedKey,
    otherTags: tags,
    enabled: valueFocused,
  });

  const keyOptions = [
    ...new Set([...(tagHintsQuery.data ?? []), ...localKeyOptions]),
  ];
  const valueOptions = [
    ...new Set([
      ...(tagValueHintsQuery.data ?? []),
      ...localValueOptions,
      ...varSuggestions,
    ]),
  ];

  const handleDelete = (key: string) => {
    const next = { ...(tags ?? {}) };
    delete next[key];
    onChange(next);
  };

  const handleAdd = () => {
    const nextKey = keyDraft.trim();
    const nextValue = valueDraft.trim();
    if (!nextKey || !nextValue) {
      return;
    }
    onChange({ ...(tags ?? {}), [nextKey]: nextValue });
    setKeyDraft('');
    setValueDraft('');
  };

  const canAdd = keyDraft.trim().length > 0 && valueDraft.trim().length > 0;

  return (
    <Group gap="xs" wrap="wrap" align="flex-end">
      {entries.map(([key, value]) => (
        <Popover
          key={key}
          opened={hoveredKey === key}
          position="bottom"
          withArrow
          shadow="md"
        >
          <Popover.Target>
            <Button
              variant="light"
              size="xs"
              onClick={() => setHoveredKey(key)}
              onMouseEnter={() => setHoveredKey(key)}
              onMouseLeave={() => setHoveredKey(null)}
            >
              <Text size="sm">
                <Text span c="blue.6" fw={600}>
                  {key}
                </Text>
                <Text span c="dimmed">
                  =
                </Text>
                <Text span c="teal.6" fw={600}>
                  {value}
                </Text>
              </Text>
            </Button>
          </Popover.Target>
          <Popover.Dropdown
            onMouseEnter={() => setHoveredKey(key)}
            onMouseLeave={() => setHoveredKey(null)}
          >
            <Group gap="xs" justify="space-between">
              <Text size="xs">Delete tag</Text>
              <ActionIcon
                variant="subtle"
                color="red"
                size="sm"
                onClick={() => handleDelete(key)}
              >
                <X size={12} />
              </ActionIcon>
            </Group>
          </Popover.Dropdown>
        </Popover>
      ))}
      <Group gap={4} align="center">
        <Autocomplete
          data={keyOptions}
          value={keyDraft}
          placeholder="tag"
          size="sm"
          aria-label="tag"
          onFocus={() => setKeyFocused(true)}
          onChange={setKeyDraft}
        />
        <Text size="sm" c="dimmed">
          =
        </Text>
        <Autocomplete
          data={valueOptions}
          value={valueDraft}
          placeholder="value"
          size="sm"
          aria-label="Tag value"
          onFocus={() => setValueFocused(true)}
          onChange={setValueDraft}
        />
        <ActionIcon
          variant="light"
          color="blue"
          onClick={handleAdd}
          disabled={!canAdd}
        >
          <Plus size={14} />
        </ActionIcon>
      </Group>
    </Group>
  );
}

export function GaugeConfigEditor({
  conf,
  onChange,
}: {
  conf: GaugeQueryConfig;
  onChange: (next: GaugeQueryConfig) => void;
}) {
  return (
    <Group gap="sm" align="flex-end" wrap="wrap">
      <InputWrapper label="Resolution" size="sm">
        <Select
          data={RESOLUTION_OPTIONS}
          value={conf.resolution ?? null}
          placeholder="secondly"
          onChange={(value) =>
            onChange({ ...conf, resolution: (value as RES_TYPE) ?? undefined })
          }
        />
      </InputWrapper>
      <InputWrapper label="Aggregation" size="sm">
        <Select
          data={AGGREGATION_OPTIONS}
          value={conf.aggregation ?? null}
          placeholder="avg"
          onChange={(value) =>
            onChange({ ...conf, aggregation: (value as AGG_TYPE) ?? undefined })
          }
        />
      </InputWrapper>
    </Group>
  );
}

export function HistoConfigEditor({
  conf,
  onChange,
}: {
  conf: HistoQueryConfig;
  onChange: (next: HistoQueryConfig) => void;
}) {
  return (
    <Group gap="sm" align="flex-end" wrap="wrap">
      <InputWrapper label="Temporality" size="sm">
        <Select
          data={TEMPORALITY_OPTIONS}
          value={conf.temporality ?? null}
          placeholder="delta"
          onChange={(value) =>
            onChange({
              ...conf,
              temporality: (value as TEMPORALITY) ?? undefined,
            })
          }
        />
      </InputWrapper>
    </Group>
  );
}

export function SumsConfigEditor({
  conf,
  onChange,
}: {
  conf: GetSumsQueryConfig;
  onChange: (next: GetSumsQueryConfig) => void;
}) {
  return (
    <Group gap="sm" align="flex-end" wrap="wrap">
      <InputWrapper label="Temporality" size="sm">
        <Select
          data={TEMPORALITY_OPTIONS}
          value={conf.temporality ?? null}
          placeholder="delta"
          onChange={(value) =>
            onChange({
              ...conf,
              temporality: (value as TEMPORALITY) ?? undefined,
            })
          }
        />
      </InputWrapper>
    </Group>
  );
}
