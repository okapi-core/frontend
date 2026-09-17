import { SelectWithMenu } from '@/components/select-with-menu';
import { AGG_TYPE, RES_TYPE } from '@/lib/request-types';
import { Group, MultiSelect } from '@mantine/core';
import { selectAttributes } from '../lib';
import { useAttributeHints } from '../queries';
import { useSpansHomeStore } from '../store';

const AGG_OPTIONS: { value: AGG_TYPE; label: string }[] = [
  { value: 'AVG', label: 'Average' },
  { value: 'SUM', label: 'Sum' },
  { value: 'MIN', label: 'Min' },
  { value: 'MAX', label: 'Max' },
  { value: 'COUNT', label: 'Count' },
  { value: 'P50', label: 'P50' },
  { value: 'P75', label: 'P75' },
  { value: 'P90', label: 'P90' },
  { value: 'P95', label: 'P95' },
  { value: 'P99', label: 'P99' },
];

const RES_OPTIONS: { value: RES_TYPE; label: string }[] = [
  { value: 'SECONDLY', label: 'Secondly' },
  { value: 'MINUTELY', label: 'Minutely' },
  { value: 'HOURLY', label: 'Hourly' },
];

export function SpansStatsCfgInput() {
  const numericalCfg = useSpansHomeStore((state) => state.numericalAggConfig);
  const hints = useAttributeHints();
  const setNumericalAttribs = useSpansHomeStore(
    (state) => state.setStatsNumericalAttribs,
  );
  const statsNumericalAttribs = useSpansHomeStore(
    (state) => state.statsNumericalAttribs,
  );
  const setNumericalAggConfig = useSpansHomeStore(
    (state) => state.setNumericalAggConfig,
  );
  const numericalAttributes = selectAttributes({
    resp: hints.data?.data,
    type: 'number',
  });
  const aggregation = numericalCfg?.aggregation;
  const resolution = numericalCfg?.resType;

  const updateAggregation = (next?: string) => {
    const nextValue = next as AGG_TYPE | undefined;
    setNumericalAggConfig({ aggregation: nextValue, resType: resolution });
  };

  const updateResolution = (next?: string) => {
    const nextValue = next as RES_TYPE | undefined;
    setNumericalAggConfig({ aggregation, resType: nextValue });
  };

  return (
    <Group align="flex-end" wrap="wrap">
      <MultiSelect
        w="20rem"
        label={'Attributes'}
        size="xs"
        data={numericalAttributes}
        value={statsNumericalAttribs || []}
        onChange={(v) => {
          setNumericalAttribs(v);
        }}
      />
      <SelectWithMenu
        label="agg"
        options={AGG_OPTIONS}
        value={aggregation}
        onChange={updateAggregation}
      />
      <SelectWithMenu
        label="res"
        options={RES_OPTIONS}
        value={resolution}
        onChange={updateResolution}
      />
    </Group>
  );
}
