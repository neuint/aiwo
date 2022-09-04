import React, { FC, useEffect, useCallback, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { memoize } from 'lodash';
import { WriteType } from '@neuint/term-js-react';
import { ModalComponent } from '@neuint/modals-plugin-react';
import { FlowType, StepType } from '@neuint/flows-plugin';

import '../index.scss';

import { getWrite } from '@root/utils/terminal';
import { worldSetTemp, worldClearTemp } from '@ducks/world';
import useTranslation from '@hooks/useTranslation';
import { MATERIALS } from '@common/constants/materials';
import { MIN_SIZE } from '@common/constants/size';
import { ParamsType } from '@common/World/elements/Box/types';
import { CommonPropsType } from '@root/components/_flows/types';
import { getTempElement } from '@ducks/world/selectors';
import NumberStep from '../../_steps/NumberStep';
import ChooseStep from '../../_steps/ChooseStep';

const getLabel = memoize((str: string): WriteType => {
  return getWrite({ str, lock: true, className: 'ElementFlow__label' });
});

const MATERIALS_NAME_LIST = Object.keys(MATERIALS);

const AddElementFlow: FC<CommonPropsType> = (props: CommonPropsType) => {
  const { addFlow, addCommands, setModal } = props;
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const tempElement = useSelector(getTempElement);
  const flow = useRef<FlowType>([]);
  const isModalOpen = useRef(false);

  const materials = useMemo((): string[] => {
    return MATERIALS_NAME_LIST.map((name): string => {
      return t(`_materials.${name}`);
    });
  }, [t]);

  useEffect(() => {
    addCommands([t('AddElementFlow.add')]);
  }, [t, addCommands]);

  useEffect(() => {
    if (!tempElement && isModalOpen.current) {
      isModalOpen.current = false;
      setModal();
    }
  }, [setModal, tempElement]);

  const setPosition = useCallback((data: { [key: string]: string }, _: string, index: number) => {
    const closeHandler = (): void => {
      isModalOpen.current = false;
      dispatch(worldClearTemp());
    };
    setModal(
      <ModalComponent escHide onClose={closeHandler}>
        <div className="ElementFlow__center">
          {t('_common.choosePosition')}
        </div>
      </ModalComponent>,
    );
    isModalOpen.current = true;
    dispatch(worldSetTemp({
      width: Number(data.width),
      height: Number(data.height),
      color: MATERIALS[MATERIALS_NAME_LIST[index]],
    } as ParamsType));
  }, [t, setModal, dispatch]);

  const addStep = useCallback((step: StepType): number => {
    const index = flow.current.length;
    flow.current = [...flow.current, step];
    addFlow({ [t('AddElementFlow.add')]: flow.current });
    return index;
  }, [t, addFlow]);

  const replaceStep = useCallback((index: number, step?: StepType) => {
    if (step) {
      flow.current[index] = step;
    } else {
      flow.current.splice(index, 1);
    }
  }, []);

  const heightLabelGetter = useCallback((data: { [key: string]: string }) => {
    return getLabel(t('_common.enterHeight', { default: data.width }));
  }, [t]);

  return (
    <>
      <NumberStep
        {...props}
        name="width"
        minValue={MIN_SIZE}
        write={getLabel(t('_common.enterWidth'))}
        addStep={addStep}
        replaceStep={replaceStep}
      />
      <NumberStep
        {...props}
        name="height"
        minValue={MIN_SIZE}
        defaultValueKey="width"
        write={heightLabelGetter}
        addStep={addStep}
        replaceStep={replaceStep}
      />
      <ChooseStep
        {...props}
        name="material"
        values={materials}
        write={getLabel(t('_common.enterMaterial'))}
        addStep={addStep}
        replaceStep={replaceStep}
        onSubmit={setPosition}
      />
    </>
  );
};

export default AddElementFlow;
