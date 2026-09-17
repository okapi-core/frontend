import TimeRangePicker from '@/components/custom-component-tray/time-range-picker';
import { PageCanvas } from '@/components/page-canvas';
import { useUserData } from '@/lib/context';
import { getDefaultInterval } from '@/lib/date-utils';
import { Select, Stack } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getSvcList } from './lib';
import { EdgeRedSidebar } from './parts/edge-red-side-bar';
import { PeerListPart } from './parts/peer-list-part';
import { PerOpPart } from './parts/per-op-part';
import { ResolutionPart } from './parts/resolution-part';
import { ServiceRedPart } from './parts/service-red-part';
import { useRedMetrics, useSvcList } from './queries';
import { useRedBoardStore } from './store';

export default function RedBoard() {
  const { currentOrg } = useUserData();
  return (
    <PageCanvas
      path={[{ label: 'Service health', href: '/main/svc-health' }]}
      inner={<Inner />}
      sidebarProps={{
        org: currentOrg,
        activeItem: 'svc-health',
      }}
    />
  );
}

export function Inner() {
  const [timeRange, setTimeRange] = useState<{
    startMs: number;
    endMs: number;
  }>(getDefaultInterval());
  const svcs = useSvcList(timeRange);
  const setSvc = useRedBoardStore((state) => state.setService);
  const [searchParams] = useSearchParams();
  const serviceFromUrl = searchParams.get('service');
  const svcList = getSvcList(svcs.data?.data);
  const svc = useRedBoardStore((state) => state.service);
  const resType = useRedBoardStore((state) => state.resType);
  const reds = useRedMetrics({
    interval: { startMs: timeRange.startMs, endMs: timeRange.endMs },
    res: resType,
    svc: svc,
  });
  useEffect(() => {
    if (serviceFromUrl) setSvc(serviceFromUrl);
  }, [serviceFromUrl, setSvc]);
  return (
    <Stack gap="md">
      <TimeRangePicker
        value={timeRange}
        onChange={(nextRange) => setTimeRange(nextRange)}
      />
      <ResolutionPart />
      <Select
        label="service"
        w={'fit-content'}
        data={svcList}
        value={svc}
        onChange={(svc) => {
          setSvc(svc || '');
        }}
      />
      <PeerListPart />
      <ServiceRedPart />
      <PerOpPart />
      <EdgeRedSidebar />
    </Stack>
  );
}
