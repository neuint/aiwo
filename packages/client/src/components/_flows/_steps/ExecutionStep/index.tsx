import { FC, useCallback, useMemo } from 'react';
import { StepResultType } from '@neuint/flows-plugin';

import { StepPropsType } from '@root/components/_flows/types';
import useStep from '../../_hooks/useStep';

type PropsType = StepPropsType & {
  execute: (data: { [key: string]: string }) => void | Promise<StepResultType | undefined>;
  onSubmit?: (data: { [key: string]: string }) => void | Promise<StepResultType | undefined>;
};

const ExecutionStep: FC<PropsType> = (props: PropsType) => {
  const { execute, onSubmit } = props;

  const submitHandler = useCallback((
    data: { [key: string]: string },
  ): Promise<StepResultType | undefined> => {
    const result = onSubmit ? onSubmit(data) : undefined;
    return result instanceof Promise ? result : Promise.resolve(undefined);
  }, [onSubmit]);

  const writtenHandler = useCallback((
    data: { [key: string]: string },
  ): void | Promise<StepResultType | undefined> => {
    const result = execute(data);
    return result instanceof Promise
      ? result
      : Promise.resolve(undefined);
  }, [execute]);

  const step = useMemo(() => ({
    onSubmit: submitHandler,
    onWrite: writtenHandler,
  }), [submitHandler, writtenHandler]);

  useStep(props, step);
  return null;
};

export default ExecutionStep;
