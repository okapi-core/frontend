import { useCallback, useEffect, useRef, useState } from 'react';

export function useRunQuerySnapshot<T>(
  value: T,
  { autoRun = false }: { autoRun?: boolean } = {},
) {
  const latestRef = useRef(value);
  const [snapshot, setSnapshot] = useState<T | null>(autoRun ? value : null);
  const [runKey, setRunKey] = useState(0);
  const [hasRun, setHasRun] = useState(autoRun);

  useEffect(() => {
    latestRef.current = value;
  }, [value]);

  useEffect(() => {
    if (!autoRun || hasRun) return;
    setSnapshot(latestRef.current);
    setHasRun(true);
  }, [autoRun, hasRun]);

  const run = useCallback((next?: T) => {
    const snapshotValue = next ?? latestRef.current;
    setSnapshot(snapshotValue);
    setRunKey((prev) => prev + 1);
    setHasRun(true);
  }, []);

  return { snapshot, run, runKey, hasRun };
}

export default useRunQuerySnapshot;
