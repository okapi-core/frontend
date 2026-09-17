export type MetricLabel = { name: string; value: string };

export type MetricLegendInput = {
  metricName?: string | null;
  labels?: Record<string, string> | null;
  fullPath?: string | null;
  unit?: string;
};

export type MetricLegendEntry = {
  key: string;
  label: string;
  tooltip: string;
  metricName: string;
  unit: string;
};

function normalizeMetricName(metricName?: string | null): string {
  return metricName?.trim() || 'unnamed_metric';
}

function sortLabelEntries(
  labels?: Record<string, string> | null,
): MetricLabel[] {
  return Object.entries(labels || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function formatMetricPath(
  metricName?: string | null,
  labels?: Record<string, string> | null,
  unit = '',
): string {
  const name = normalizeMetricName(metricName);
  const entries = sortLabelEntries(labels);
  if (!entries.length) return name;
  const formatted = entries
    .map((entry) => `${entry.name}="${entry.value}"`)
    .join(',');
  return `${name}{${formatted}}${unit}`;
}

function compareLabelArrays(a: MetricLabel[], b: MetricLabel[]): number {
  const length = Math.max(a.length, b.length);
  for (let i = 0; i < length; i++) {
    const left = a[i];
    const right = b[i];
    if (!left && right) return -1;
    if (left && !right) return 1;
    if (!left || !right) continue;
    if (left.name !== right.name) return left.name.localeCompare(right.name);
    if (left.value !== right.value)
      return left.value.localeCompare(right.value);
  }
  return 0;
}

function findFirstMismatchLabel(
  current: MetricLabel[],
  next: MetricLabel[],
): MetricLabel | null {
  const length = Math.max(current.length, next.length);
  for (let i = 0; i < length; i++) {
    const left = current[i];
    const right = next[i];
    if (!left && right) return null;
    if (left && !right) return left;
    if (!left || !right) continue;
    if (left.name !== right.name || left.value !== right.value) return left;
  }
  return null;
}

export function buildMetricLegends(
  inputs: MetricLegendInput[],
): MetricLegendEntry[] {
  const normalized = inputs.map((input) => {
    const metricName = normalizeMetricName(input.metricName);
    const labels = sortLabelEntries(input.labels);
    const fullPath =
      input.fullPath?.trim() ||
      formatMetricPath(metricName, input.labels, input.unit);
    return {
      metricName,
      labels,
      fullPath,
      unit: input.unit,
    };
  });

  normalized.sort((a, b) => {
    const metricCompare = a.metricName.localeCompare(b.metricName);
    if (metricCompare !== 0) return metricCompare;
    const labelCompare = compareLabelArrays(a.labels, b.labels);
    if (labelCompare !== 0) return labelCompare;
    return a.fullPath.localeCompare(b.fullPath);
  });

  return normalized.map((current, index) => {
    const next = normalized[index + 1];
    let label = '';
    if (!next || current.metricName !== next.metricName) {
      label = `${current.metricName}{..}`;
    } else {
      const diff = findFirstMismatchLabel(current.labels, next.labels);
      if (diff) {
        label = `${current.metricName}{${diff.name}="${diff.value}" ...}`;
      } else {
        label = `${current.metricName}{..}`;
      }
    }
    return {
      key: current.fullPath,
      label,
      tooltip: current.fullPath,
      metricName: current.metricName,
      unit: current.unit || '',
    };
  });
}
