import { EdgeSideBarNote } from '@/components/edge-side-bar-note';
import { GoldenAggregateMini } from '@/components/golden-aggregate-mini';
import { RedsPanel } from '@/components/reds-panel/reds-panel';
import { SideDrawer } from '@/components/side-drawer/side-drawer';
import { Stack } from '@mantine/core';
import { deriveGoldenAggregates } from '../lib';
import { useRedBoardStore } from '../store';

const PANEL_HEIGHT = 220;

export function EdgeRedSidebar() {
  const peer = useRedBoardStore((state) => state.peer);
  const clearPeer = useRedBoardStore((state) => state.clearPeer);
  const resp = useRedBoardStore((state) => state.serviceRed);
  const caller = useRedBoardStore((state) => state.serviceRed?.service);
  const resType = useRedBoardStore((state) => state.resType);
  const peerReds = resp?.peerReds?.filter((red) => red.peerService === peer);
  const resolutionLabel = resType.toLowerCase();
  return (
    <SideDrawer
      open={!!peer}
      onClose={function (): void {
        clearPeer();
      }}
      title={`Calls to ${peer}`}
    >
      {peerReds && peerReds.length > 0 && peerReds[0].redMetrics && peer && (
        <Stack mt={'lg'} p={'sm'}>
          {caller ? (
            <EdgeSideBarNote
              caller={caller}
              callee={peer}
              resolution={resolutionLabel}
            />
          ) : null}
          <GoldenAggregateMini
            {...deriveGoldenAggregates(peerReds[0].redMetrics)}
          />
          <div>
            <RedsPanel
              operation={peer}
              redMetrics={peerReds[0].redMetrics}
              h={PANEL_HEIGHT}
              w="100%"
              layout="v"
            />
          </div>
        </Stack>
      )}
    </SideDrawer>
  );
}
