import { ActionIcon } from '@mantine/core';
import { Play } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function TraceViewNav({ traceId }: { traceId?: string }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  if (!traceId) return null;

  return (
    <ActionIcon
      aria-label="Open trace"
      title="Open trace"
      variant="light"
      color="blue"
      radius="xl"
      size={24}
      onClick={(event) => {
        event.stopPropagation();
        const traceParams = new URLSearchParams({ traceId });
        const spanFilters = searchParams.get('span_filters');
        if (spanFilters) traceParams.set('span_filters', spanFilters);
        navigate(`/main/trace-view?${traceParams.toString()}`);
      }}
    >
      <Play size={11} fill="currentColor" />
    </ActionIcon>
  );
}

export default TraceViewNav;
