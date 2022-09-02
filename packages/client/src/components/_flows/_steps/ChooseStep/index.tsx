import { FC, useEffect, useCallback, useRef, useMemo } from 'react';
import { StepResultType } from '@neuint/flows-plugin';

import useTranslation from '@hooks/useTranslation';
import { StepPropsType } from '@root/components/_flows/types';
import { getError } from '../../_utils/write';
import useStep from '../../_hooks/useStep';

type PropsType = StepPropsType & {
  values: string[];
  defaultValue?: string;
  caseSensitive?: boolean;
  notSelectError?: string;
  onSubmit?: (
    data: { [key: string]: string }, value: string, index: number,
  ) => void | Promise<StepResultType | undefined>;
};

const ChooseStep: FC<PropsType> = (props: PropsType) => {
  const {
    setTempCommands, values, caseSensitive = false, name, notSelectError, onSubmit, defaultValue = '',
  } = props;
  const setItemsTimeout = useRef<ReturnType<typeof setTimeout>>();
  const { t } = useTranslation();

  const submitHandler = useCallback((
    data: { [key: string]: string }, stepIndex: number,
  ): Promise<StepResultType | undefined> => {
    const to = String(stepIndex);
    const value = (caseSensitive ? data[name] : data[name].toLowerCase()) || defaultValue;
    const index = (caseSensitive ? values : values.map((item) => item.toLowerCase()))
      .indexOf(value);
    setTempCommands();
    if (index === -1) {
      return Promise.resolve({ to, write: getError(notSelectError || t('ChooseStep.errNotFound')) });
    }
    // eslint-disable-next-line no-param-reassign
    data[name] = values[index];
    const result = onSubmit ? onSubmit(data, value, index) : undefined;
    return result instanceof Promise ? result : Promise.resolve(undefined);
  }, [t, setTempCommands, values, caseSensitive, name, notSelectError, onSubmit, defaultValue]);

  const writeHandler = useCallback(() => {
    setItemsTimeout.current = setTimeout(() => {
      setTempCommands(values, defaultValue);
    }, 10);
  }, [values, setTempCommands, defaultValue]);

  const exitHandler = useCallback(() => {
    clearTimeout(setItemsTimeout.current);
    setTempCommands();
  }, [setTempCommands]);

  useEffect(() => () => {
    if (setItemsTimeout.current) {
      clearTimeout(setItemsTimeout.current);
    }
  }, []);

  const step = useMemo(() => ({
    onSubmit: submitHandler, onWrite: writeHandler, onExit: exitHandler,
  }), [submitHandler, writeHandler, exitHandler]);

  useStep(props, step);
  return null;
};

export default ChooseStep;
