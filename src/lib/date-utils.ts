import { now } from 'lodash';

export function getDefaultInterval(): {
  startMs: number;
  endMs: number;
} {
  const nowMs = now();
  const nowMinus15m = nowMs - 15 * 60 * 1000;
  return {
    startMs: nowMinus15m,
    endMs: nowMs,
  };
}

export function roundToNearestMs(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value);
}

export function minutesToMillis(minutes: number) {
  return minutes * 60_000;
}

export function hrsToMillis(hrs: number) {
  return hrs * 3600_000;
}

export function pastNMinutes(minutes: number) {
  const nowMs = now();
  return { from: nowMs - minutesToMillis(minutes), to: nowMs };
}

export function pastNHrs(hrs: number) {
  const nowMs = now();
  return { from: nowMs - minutesToMillis(hrs), to: nowMs };
}
