export function pollUntil(fn: () => boolean, interval: number): () => void {
  const id = setInterval(() => {
    const shouldContinue = fn();
    if (!shouldContinue) {
      clearInterval(id);
    }
  }, interval);
  return () => clearInterval(id);
}
