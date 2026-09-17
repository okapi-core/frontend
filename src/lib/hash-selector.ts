export function rkHash({
  val,
  base = 31,
  mod = 1e9 + 7,
}: {
  val: string;
  base?: number;
  mod?: number;
}) {
  let h = 1;
  for (let i = 0; i < val.length; i++) {
    h = (h * base + val.charCodeAt(i)) % mod;
  }
  return h;
}
export function selectByHash<T>({
  val,
  items,
}: {
  val: string;
  items: T[];
}): T {
  const buckets = items.length;
  const idx = rkHash({ val }) % buckets;
  return items[idx];
}
