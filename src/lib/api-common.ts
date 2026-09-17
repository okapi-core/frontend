import { parseResponse } from './api-responses';

export async function postWithoutToken<T, R>({
  url,
  request,
}: {
  url: string;
  request?: T;
}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: request ? JSON.stringify(request) : undefined,
  });
  return parseResponse<R>(res);
}

export async function getWithoutToken<R>({ url }: { url: string }) {
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return parseResponse<R>(res);
}
