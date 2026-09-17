import { Button } from '@mantine/core';
import { MoveIcon } from 'lucide-react';

export function PanelDrag() {
  return (
    <Button
      className="gb-drag"
      size="compact-xs"
      variant="outline"
      bd={'none'}
      p={'0'}
      c={'blue.8'}
      style={{ cursor: 'grab' }}
    >
      <MoveIcon size={16} />
    </Button>
  );
}
