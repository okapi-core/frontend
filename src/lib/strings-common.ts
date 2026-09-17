export const BLANK = '';
export function orBlank(s?: string) {
  return s || BLANK;
}

export function orElse(alternative: string, s?: string) {
  return s || alternative;
}

// 1. Extract tokens starting with ":" separated by "/"
type ExtractPathParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ExtractPathParams<Rest>
    : T extends `${string}:${infer Param}`
      ? Param
      : never;

// 2. Map parameters to strict object keys
type PathArgs<T extends string> = [ExtractPathParams<T>] extends [never]
  ? void
  : { [K in ExtractPathParams<T>]: string | number };

// 3. Runtime replacement function
export function formatUrlPath<T extends string>(
  pathTemplate: T,
  args: PathArgs<T>,
): string {
  let result: string = pathTemplate;
  for (const [key, value] of Object.entries(args || {})) {
    result = result.replace(`:${key}`, encodeURIComponent(String(value)));
  }
  return result;
}
