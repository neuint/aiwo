import React, { FC, useEffect, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { FlowType, StepType } from '@neuint/flows-plugin';

import useTranslation from '@hooks/useTranslation';
import { CommonPropsType } from '@root/components/_flows/types';
import ExecutionStep from '@root/components/_flows/_steps/ExecutionStep';
import { worldClearSelection } from '@ducks/world';

const WorldClearSelectionFlow: FC<CommonPropsType> = (props: CommonPropsType) => {
  const { addFlow, addCommands } = props;
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const flow = useRef<FlowType>([]);

  useEffect(() => {
    addCommands([t('WorldClearSelectionFlow.clear')]);
  }, [t, addCommands]);

  const addStep = useCallback((step: StepType): number => {
    const index = flow.current.length;
    flow.current = [...flow.current, step];
    addFlow({ [t('WorldClearSelectionFlow.clear')]: flow.current });
    return index;
  }, [t, addFlow]);

  const replaceStep = useCallback((index: number, step?: StepType) => {
    if (step) {
      flow.current[index] = step;
    } else {
      flow.current.splice(index, 1);
    }
  }, []);

  const clear = useCallback(() => {
    dispatch(worldClearSelection());
  }, [dispatch]);

  return (
    <ExecutionStep
      {...props}
      name="clear"
      execute={clear}
      addStep={addStep}
      replaceStep={replaceStep}
    />
  );
};

export default WorldClearSelectionFlow;
