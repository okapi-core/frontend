export async function submitNotifyEmail({ email }: { email: string }) {
  const res = await fetch('http://previews.okapiapp.io', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    throw new Error(`Notify request failed: ${res.status}`);
  }
  return res;
}
