import { WriteItemType, WriteType } from '@neuint/term-js-react';
import { FormattedValueFragmentType } from '@neuint/term-js';

export const getWriteDuration = (data: string | number, speed: 'normal' | 'fast' | 'slaw'): number => {
  const speedMap: { [key in 'normal' | 'fast' | 'slaw']: number } = {
    normal: 68,
    fast: 160,
    slaw: 30,
  };

  return Math.round(((typeof data === 'string' ? data.length : data) / speedMap[speed]) * 250);
};

export const getWrite = (
  data: WriteItemType | WriteItemType[], speed: 'normal' | 'fast' | 'slaw' = 'normal',
): WriteType => {
  const dataList = Array.isArray(data) ? data : [data];
  const fullLength = dataList.reduce((acc, item: WriteItemType) => {
    if (typeof item === 'string') return acc + item.length;
    if (typeof (item as FormattedValueFragmentType)?.str === 'string') {
      return acc + (item as FormattedValueFragmentType).str.length;
    }
    const { value } = item as { value: string | FormattedValueFragmentType | undefined };
    if (typeof value === 'string') return acc + value.length;
    return acc + ((value as FormattedValueFragmentType).str || '').length;
  }, 0);
  return { data, duration: getWriteDuration(fullLength, speed) };
};
