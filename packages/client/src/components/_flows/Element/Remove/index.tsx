import React, { FC, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { FlowType, StepType } from '@neuint/flows-plugin';

import '../index.scss';

import useTranslation from '@hooks/useTranslation';
import { CommonPropsType } from '@root/components/_flows/types';
import { getSelected } from '@root/ducks/world/selectors';
import { getWrite } from '@root/utils/terminal';
import WorldBridge from '@root/WorldBridge';
import ConfirmationStep from '../../_steps/ConfirmationStep';

const RemoveElementFlow: FC<CommonPropsType> = (props: CommonPropsType) => {
  const { addFlow, addCommands } = props;
  const { t } = useTranslation();
  const flow = useRef<FlowType>([]);
  const selected = useSelector(getSelected);

  useEffect(() => {
    addCommands([t('RemoveElementFlow.remove')]);
  }, [t, addCommands]);

  const notSelectedBefore = useCallback(() => {
    return getWrite({
      value: { str: t('_common.notSelected'), className: 'ElementFlow__warn' },
      withSubmit: true,
    });
  }, [t]);

  const addStep = useCallback((step: StepType): number => {
    const index = flow.current.length;
    flow.current = [...flow.current, step];
    addFlow({ [t('RemoveElementFlow.remove')]: flow.current });
    return index;
  }, [t, addFlow]);

  const replaceStep = useCallback((index: number, step?: StepType) => {
    if (step) {
      flow.current[index] = step;
    } else {
      flow.current.splice(index, 1);
    }
  }, []);

  const submitHandler = useCallback((data: { [key: string]: string }, value: boolean) => {
    if (value) {
      const bridge = WorldBridge.get();
      selected.forEach((id) => bridge.removeElement(id));
    }
  }, [selected]);

  return (
    <ConfirmationStep
      {...props}
      before={selected.length ? undefined : notSelectedBefore}
      question={t('RemoveElementFlow.question', { count: selected.length })}
      name="confirm"
      type="warning"
      addStep={addStep}
      replaceStep={replaceStep}
      onSubmit={submitHandler}
    />
  );
};

export default RemoveElementFlow;
