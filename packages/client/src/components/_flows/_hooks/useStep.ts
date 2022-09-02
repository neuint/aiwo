import { useRef, useEffect, useMemo, useCallback } from 'react';
import { StepType, StepResultType } from '@neuint/flows-plugin';

import { StepPropsType } from '@root/components/_flows/types';

const useStep = (
  props: StepPropsType,
  step: StepType & {
    onSubmit?: (
      data: { [key: string]: string }, stepIndex: number,
    ) => Promise<StepResultType | undefined>
  } = {},
): [number] => {
  const { replaceStep, addStep, name, write, onWrite } = props;
  const stepIndex = useRef<number>(-1);

  const complexHandler = useCallback(async (data: { [key: string]: string }) => {
    const stepResult = await step.onSubmit?.(data, stepIndex.current);
    return stepResult;
  }, [step]);

  const updatedStep = useMemo((): StepType => ({
    variableName: name,
    ...(write ? { write } : {}),
    ...(write && onWrite ? { onWrite } : {}),
    ...step,
    handler: step.onSubmit ? complexHandler : step.handler,
  }), [step, name, write, onWrite, complexHandler]);

  useEffect(() => {
    if (stepIndex.current >= 0) {
      replaceStep(stepIndex.current, updatedStep);
    } else {
      stepIndex.current = addStep(updatedStep);
    }
    return (): void => replaceStep(stepIndex.current, updatedStep);
  }, [addStep, replaceStep, updatedStep]);

  useEffect(() => (): void => {
    replaceStep(stepIndex.current);
  }, [replaceStep]);
  return [stepIndex.current];
};

export default useStep;
