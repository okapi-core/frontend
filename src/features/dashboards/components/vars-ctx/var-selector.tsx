import { fetchVarHints } from '@/lib/domain/metrics';
import { ListVarsResponse } from '@/lib/response-types';
import { Autocomplete, Group } from '@mantine/core';
import { useQueries } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

export function VarValueSelector({
  vars,
  ctx,
  timeRange,
  onChange,
  selectorWidth = 220,
}: {
  vars: ListVarsResponse;
  ctx: { [key: string]: string };
  timeRange?: { startMs: number; endMs: number };
  onChange: (nextCtx: { [key: string]: string }) => void;
  selectorWidth?: number | string;
}) {
  const defaultRange = useRef({
    startMs: Date.now() - 15 * 60 * 1000,
    endMs: Date.now(),
  });
  const effectiveRange = timeRange ?? defaultRange.current;
  const [activeVars, setActiveVars] = useState<Record<string, boolean>>({});
  const [editingVars, setEditingVars] = useState<Record<string, boolean>>({});
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});
  const varsList = vars?.vars || [];

  useEffect(() => {
    setDraftValues((prev) => {
      const next = { ...prev };
      for (const v of varsList) {
        const name = v.name;
        if (!name) continue;
        if (!editingVars[name]) {
          next[name] = ctx[name] || '';
        }
      }
      return next;
    });
  }, [ctx, varsList, editingVars]);

  const hintsQueries = useQueries({
    queries: varsList.map((v, index) => {
      const nameKey = v.name || `var-${index}`;
      return {
        queryKey: [
          'var-hints',
          nameKey,
          v.type,
          v.tag,
          effectiveRange.startMs,
          effectiveRange.endMs,
        ],
        queryFn: () =>
          fetchVarHints({
              varType: v.type,
              tag: v.type === 'TAG_VALUE' ? v.tag : undefined,
              constraint: {
                start: effectiveRange.startMs,
                end: effectiveRange.endMs,
              },
          }),
        enabled: Boolean(v.name && activeVars[nameKey]),
        staleTime: 60 * 1000,
      };
    }),
  });

  const commitValue = (varName: string, value: string) => {
    onChange({
      ...ctx,
      [varName]: value,
    });
  };

  return (
    <Group gap="sm" wrap="wrap">
      {varsList.map((v, index) => {
        const nameKey = v.name || `var-${index}`;
        const hints = hintsQueries[index]?.data?.data?.suggestions || [];
        const value = v.name ? (draftValues[v.name] ?? '') : '';
        return (
          <Autocomplete
            key={nameKey}
            w={selectorWidth}
            label={v.name || 'Variable'}
            placeholder="Enter value"
            data={hints}
            value={value}
            onChange={(value) => {
              const varName = v.name;
              if (!varName) return;
              setDraftValues((prev) => ({
                ...prev,
                [varName]: value,
              }));
            }}
            onFocus={() => {
              setActiveVars((prev) => {
                if (prev[nameKey]) return prev;
                return { ...prev, [nameKey]: true };
              });
              if (v.name) {
                setEditingVars((prev) => ({
                  ...prev,
                  [v.name as string]: true,
                }));
              }
            }}
            onBlur={() => {
              if (!v.name) return;
              setEditingVars((prev) => ({
                ...prev,
                [v.name as string]: false,
              }));
              commitValue(v.name, value);
            }}
            onKeyDown={(event) => {
              if (event.key !== 'Enter') return;
              if (!v.name) return;
              event.preventDefault();
              commitValue(v.name, value);
            }}
          />
        );
      })}
    </Group>
  );
}
