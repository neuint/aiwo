import React, { FC, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { memoize } from 'lodash';
import { WriteType } from '@neuint/term-js-react';
import { ModalComponent } from '@neuint/modals-plugin-react';
import { FlowType, StepType } from '@neuint/flows-plugin';

import { getWrite } from '@root/utils/terminal';
import * as world from '@root/ducks/world';
import * as worldSelectors from '@root/ducks/world/selectors';
import { CommonPropsType } from '@root/components/_flows/types';
import useTranslation from '@hooks/useTranslation';
import { generateWorldInfo } from '@common/utils/world';
import NumberStep from '../../_steps/NumberStep';
import ConfirmationStep from '../../_steps/ConfirmationStep';

import './index.scss';

const getLabel = memoize((str: string): WriteType => {
  return getWrite({ str, lock: true, className: 'ElementFlow__label' });
});

const GenerateWorldFlow: FC<CommonPropsType> = (
  props: CommonPropsType,
) => {
  const { addFlow, addCommands, setModal } = props;
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const flow = useRef<FlowType>([]);
  const isGenerating = useSelector(worldSelectors.checkGenerating);
  const generateError = useSelector(worldSelectors.getGenerateError);

  useEffect(() => {
    addCommands([t('_flows.world.generateWorld')]);
  }, [t, addCommands]);

  const addStep = useCallback((step: StepType): number => {
    const index = flow.current.length;
    flow.current = [...flow.current, step];
    addFlow({ [t('_flows.world.generateWorld')]: flow.current });
    return index;
  }, [t, addFlow]);

  const replaceStep = useCallback((index: number, step?: StepType) => {
    if (step) {
      flow.current[index] = step;
    } else {
      flow.current.splice(index, 1);
    }
  }, []);

  useEffect(() => {
    if (!isGenerating) setModal();
  }, [isGenerating, generateError, setModal]);

  const run = useCallback((amount: number, withoutCharacters: boolean) => {
    const info = generateWorldInfo(amount, withoutCharacters);
    dispatch(world.worldExport(info));
  }, [dispatch]);

  const submitHandler = useCallback((data: { [key: string]: string }, value: boolean) => {
    setModal(
      <ModalComponent>
        <div className="GenerateWorldFlow__center">
          {t('_flows.world.generating')}
        </div>
      </ModalComponent>,
    );
    run(parseInt(data.amount, 10), value);
  }, [t, run, setModal]);

  return (
    <>
      <NumberStep
        {...props}
        name="amount"
        minValue={1}
        write={getLabel(t('_flows.world.amount'))}
        addStep={addStep}
        replaceStep={replaceStep}
      />
      <ConfirmationStep
        {...props}
        type="common"
        name="withoutCharacters"
        question={t('_flows.world.withoutCharacters')}
        addStep={addStep}
        replaceStep={replaceStep}
        onSubmit={submitHandler}
      />
    </>
  );
};

export default GenerateWorldFlow;
