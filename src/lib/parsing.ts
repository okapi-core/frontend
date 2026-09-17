export function parseWithoutFail<T>(content: string, fallback: T): { data: T } {
  try {
    const parsed = JSON.parse(content) as T;
    return { data: parsed };
  } catch (e) {
    return { data: fallback };
  }
}
