import { FC, useCallback, useMemo } from 'react';
import { StepResultType } from '@neuint/flows-plugin';

import useTranslation from '@hooks/useTranslation';
import { StepPropsType } from '@root/components/_flows/types';
import { getError } from '../../_utils/write';
import useStep from '../../_hooks/useStep';

type PropsType = StepPropsType & {
  minValue?: number;
  defaultValue?: number;
  lessError?: string;
  valueError?: string;
  onSubmit?: (
    data: { [key: string]: string }, value: number,
  ) => void | Promise<StepResultType | undefined>;
};

const NumberStep: FC<PropsType> = (props: PropsType) => {
  const { t } = useTranslation();
  const {
    name, onSubmit, minValue, lessError, valueError, defaultValue, defaultValueKey, before,
  } = props;

  const submitHandler = useCallback((
    data: { [key: string]: string }, stepIndex: number,
  ): Promise<StepResultType | undefined> => {
    const to = String(stepIndex);
    const itemData = data[name].trim();
    let value = parseFloat(data[name].trim());
    if (itemData === '') {
      value = (defaultValue === undefined
        ? parseFloat(data[defaultValueKey || ''])
        : defaultValue) || NaN;
    }
    if (Number.isNaN(value)) {
      return Promise.resolve({ to, write: getError(valueError || t('NumberStep.errParse')) });
    }
    if (minValue !== undefined && value < minValue) {
      return Promise.resolve({ to, write: getError(lessError || t('NumberStep.errLess', { minValue })) });
    }
    // eslint-disable-next-line no-param-reassign
    data[name] = String(value);
    const result = onSubmit ? onSubmit(data, value) : undefined;
    return result instanceof Promise ? result : Promise.resolve(undefined);
  }, [t, name, minValue, defaultValue, defaultValueKey, onSubmit, valueError, lessError]);

  const step = useMemo(() => ({ before, onSubmit: submitHandler }), [submitHandler, before]);

  useStep(props, step);
  return null;
};

export default NumberStep;
