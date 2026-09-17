export function FallbackContainer({
  loading,
  fallback,
  children,
}: {
  loading: boolean;
  fallback: React.ReactNode;
  children: React.ReactNode;
}) {
  if (loading) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
