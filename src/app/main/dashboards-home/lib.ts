export function getCurrentEndpoint(): string {
  if (typeof window === 'undefined') return '';
  return window.location.origin;
}
