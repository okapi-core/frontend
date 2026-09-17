'use client';

import { useEffect, useMemo, useState } from 'react';

export function HumanTime({ date }: { date: string }) {
  const targetDate = useMemo(() => new Date(date), [date]);
  const isInvalid = Number.isNaN(targetDate.getTime());
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    if (isInvalid) return;
    const updateInterval = () => {
      const diffMs = Math.abs(now.getTime() - targetDate.getTime());
      if (diffMs < 60_000) return 1_000; // update every second for < 1 min
      if (diffMs < 3_600_000) return 30_000; // every 30s for < 1 hour
      return 300_000; // every 5 min beyond
    };

    const id = setInterval(() => setNow(new Date()), updateInterval());
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetDate.getTime(), isInvalid, now]);

  if (isInvalid) return <span>-</span>;

  const label = formatRelativeTime(targetDate, now);
  return <span title={targetDate.toLocaleString()}>{label}</span>;
}

function formatRelativeTime(date: Date, base: Date): string {
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  const diffMs = date.getTime() - base.getTime();

  const seconds = Math.round(diffMs / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);
  const months = Math.round(days / 30);
  const years = Math.round(days / 365);

  if (Math.abs(seconds) < 60) return rtf.format(seconds, 'second');
  if (Math.abs(minutes) < 60) return rtf.format(minutes, 'minute');
  if (Math.abs(hours) < 24) return rtf.format(hours, 'hour');
  if (Math.abs(days) < 30) return rtf.format(days, 'day');
  if (Math.abs(months) < 12) return rtf.format(months, 'month');
  return rtf.format(years, 'year');
}

export default HumanTime;
