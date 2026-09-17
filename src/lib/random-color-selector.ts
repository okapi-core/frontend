import { MantineColor } from '@mantine/core';
import { selectByHash } from './hash-selector';

const PALETTE: MantineColor[] = [
  'dark',
  'gray',
  'red',
  'pink',
  'grape',
  'violet',
  'indigo',
  'blue',
  'cyan',
  'green',
  'lime',
  'yellow',
  'orange',
  'teal',
].map((s) => s + '.7');
export function getHashSelectedColor({ val }: { val: string }) {
  return selectByHash({ val, items: PALETTE });
}
