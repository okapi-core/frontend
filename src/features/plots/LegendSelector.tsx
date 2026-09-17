'use client';
/**
 * LegendSelector
 *
 * A lightweight, DOM-based legend that controls which series are visible.
 * Intended to be used with LineChart via ChartWithLegend, but can be used
 * standalone. Supports Shift+Click to "solo" a series, and Shift+Click again
 * on an already soloed series to toggle to "all except current".
 *
 * Props
 * - legends: string[] of series names in display order
 * - colors: string[] color for each legend (HSL/HSLA recommended)
 * - value: string[] currently selected/visible legend names
 * - onChange(next): update selected names
 * - soloOnShift: enable Shift+Click solo behavior (default true)
 *
 * Example
 *   <LegendSelector
 *     legends={["CPU_1", "CPU_2"]}
 *     colors={["hsl(210,70%,45%)", "hsl(120,70%,45%)"]}
 *     value={["CPU_1"]}
 *     onChange={(next) => setSelected(next)}
 *   />
 */
import { Group, ScrollArea, Tooltip, UnstyledButton } from '@mantine/core';
import { useEffect, useRef, useState } from 'react';

export type LegendItem = {
  id: string;
  label: string;
  tooltip?: string;
};

export function LegendSelector({
  items,
  colors,
  value,
  onChange,
  soloOnShift = true,
  wrap = 'nowrap',
}: {
  items: LegendItem[];
  colors: string[];
  value: string[];
  onChange: (next: string[]) => void;
  soloOnShift?: boolean;
  wrap?: 'wrap' | 'nowrap';
}) {
  const selectedSet = new Set(value);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copyTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  function toggle(id: string, shift: boolean) {
    if (soloOnShift && shift) {
      const isSolo = value.length === 1 && value[0] === id;
      if (isSolo) {
        // If already solo-selected, invert: select all except current
        onChange(items.map((item) => item.id).filter((n) => n !== id));
      } else {
        // Enter solo mode: select only this series
        onChange([id]);
      }
      return;
    }
    const next = new Set(value);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(Array.from(next));
  }

  function handleCopy(id: string, value?: string) {
    if (!value) return;
    const write = navigator?.clipboard?.writeText;
    if (write) write.call(navigator.clipboard, value).catch(() => {});
    setCopiedId(id);
    if (copyTimeoutRef.current) {
      window.clearTimeout(copyTimeoutRef.current);
    }
    copyTimeoutRef.current = window.setTimeout(() => {
      setCopiedId(null);
    }, 1200);
  }

  function parseHsl(input: string): { h: number; s: number; l: number } | null {
    try {
      const m = input
        .replace(/\s+/g, '')
        .match(
          /^hsl[a]?\((\d+(?:\.\d+)?),?(\d+(?:\.\d+)?)%?,?(\d+(?:\.\d+)?)%?(?:,.*)?\)$/i,
        );
      if (!m) return null;
      return { h: Number(m[1]), s: Number(m[2]), l: Number(m[3]) };
    } catch {
      return null;
    }
  }

  const hsl = (h: number, s: number, l: number) => `hsl(${h}, ${s}%, ${l}%)`;
  const hsla = (h: number, s: number, l: number, a: number) =>
    `hsla(${h}, ${s}%, ${l}%, ${a})`;

  return (
    <ScrollArea
      type="auto"
      scrollbarSize={6}
      style={{ height: '100%', overflowX: 'hidden' }}
    >
      <Group
        gap={6}
        wrap={wrap}
        px="xs"
        style={{ height: '100%' }}
        align="center"
      >
        {items.map((item, i) => {
          const active = selectedSet.has(item.id);
          const color = colors[i] || '#888';
          const parsed = parseHsl(color);
          const textColor = parsed
            ? hsl(parsed.h, parsed.s, Math.max(20, Math.min(60, parsed.l - 20)))
            : color;
          const bgColor = parsed
            ? hsla(
                parsed.h,
                parsed.s,
                Math.min(
                  92,
                  Math.max(parsed.l + 10, Math.min(85, parsed.l + 25)),
                ),
                0.22,
              )
            : color;
          const canCopy = !!item.tooltip && item.tooltip !== item.label;
          const tooltipText =
            copiedId === item.id
              ? 'Copied'
              : item.tooltip
                ? canCopy
                  ? `${item.tooltip} (right-click to copy)`
                  : item.tooltip
                : undefined;
          const chip = (
            <UnstyledButton
              key={item.id}
              type="button"
              onClick={(e) => toggle(item.id, e.shiftKey)}
              onContextMenu={(e) => {
                if (!canCopy) return;
                e.preventDefault();
                handleCopy(item.id, item.tooltip);
              }}
              aria-pressed={active}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                borderRadius: 6,
                height: 20,
                padding: '0 8px',
                fontSize: 10,
                fontWeight: 600,
                transition: 'background-color 120ms ease',
                color: active ? textColor : undefined,
                backgroundColor: active ? bgColor : 'transparent',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  height: 2,
                  width: 14,
                  borderRadius: 4,
                  backgroundColor: color,
                }}
                aria-hidden
              />
              <span
                style={{
                  maxWidth: 'fit-content',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {item.label}
              </span>
            </UnstyledButton>
          );
          // Wrap with tooltip to show full legend when truncated
          return (
            <Tooltip
              key={item.id}
              label={tooltipText || item.label}
              withArrow
              disabled={!tooltipText}
            >
              {chip}
            </Tooltip>
          );
        })}
      </Group>
    </ScrollArea>
  );
}
