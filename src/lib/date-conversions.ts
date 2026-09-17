export function toNanos({ millis }: { millis: number }) {
  return millis * 1000000;
}

export function nanosToMillis({ nanos }: { nanos: number }) {
  return nanos / 1_000_000;
}

export function truncateDecimal({
  value,
  places = 2,
}: {
  value: number;
  places?: number;
}) {
  const factor = Math.pow(10, places);
  return Math.trunc(value * factor) / factor;
}

export function truncateToN({
  value,
  places,
}: {
  value: number;
  places: number;
}) {
  return truncateDecimal({ value, places }).toFixed(places);
}

export function getDurationColor({ durationMs }: { durationMs: number }) {
  if (durationMs > 500) return 'red';
  if (durationMs > 100) return 'yellow';
  return undefined;
}

export function nanosToHuman({ nanos }: { nanos: number | undefined }) {
  if (!nanos) return '';
  const millis = nanosToMillis({ nanos });
  return new Date(millis).toLocaleString();
}

export function milliDurationBetweenNs({
  startNs,
  endNs,
}: {
  startNs: number;
  endNs: number;
}) {
  return nanosToMillis({ nanos: endNs - startNs });
}
