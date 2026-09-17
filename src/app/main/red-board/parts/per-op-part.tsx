import { GoldenAggregateMini } from '@/components/golden-aggregate-mini';
import { RedsPanel } from '@/components/reds-panel/reds-panel';
import { Accordion, Stack, Text } from '@mantine/core';
import { deriveGoldenAggregates, normalizeMetrics } from '../lib';
import { useRedBoardStore } from '../store';

const PANEL_HEIGHT = 220;

export function PerOpPart() {
  const opReds = useRedBoardStore((state) => state.serviceRed?.serviceOpReds);
  if (!opReds || opReds.length === 0) return null;

  return (
    <Stack gap="sm">
      <Text fw={600}>Operations</Text>
      <Accordion multiple variant="separated">
        {opReds.map((opRed, index) => {
          if (!opRed?.op || !opRed?.redMetrics) return null;
          const opName = opRed.op || `op-${index}`;
          return (
            <Accordion.Item key={`${opName}-${index}`} value={opName}>
              <Accordion.Control>{opName}</Accordion.Control>
              <Accordion.Panel>
                <Stack gap="sm">
                  <GoldenAggregateMini
                    {...deriveGoldenAggregates(opRed.redMetrics)}
                  />
                <RedsPanel
                  operation={opName}
                  redMetrics={normalizeMetrics(opRed.redMetrics)}
                  h={PANEL_HEIGHT}
                  w="100%"
                  />
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          );
        })}
      </Accordion>
    </Stack>
  );
}
