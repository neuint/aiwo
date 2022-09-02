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
import { getFirstSelected, getSelected, getTempElement } from '@ducks/world/selectors';
import NumberStep from '../../_steps/NumberStep';
import ChooseStep from '../../_steps/ChooseStep';

const getLabel = memoize((str: string): WriteType => {
  return getWrite({ str, lock: true, className: 'ElementFlow__label' });
});

const MATERIALS_NAME_LIST = Object.keys(MATERIALS);

const EditElementFlow: FC<CommonPropsType> = (props: CommonPropsType) => {
  const { addFlow, addCommands, setModal } = props;
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const tempElement = useSelector(getTempElement);
  const flow = useRef<FlowType>([]);
  const isModalOpen = useRef(false);
  const selectedElements = useSelector(getSelected);
  const element = useSelector(getFirstSelected) as ParamsType;

  const currentMaterial = useMemo(() => {
    if (!element) return '';
    const currentName = MATERIALS_NAME_LIST.find((checkName) => {
      return element.color === MATERIALS[checkName];
    });
    return t(`_materials.${currentName}`);
  }, [t, element]);

  const materials = useMemo((): string[] => {
    return MATERIALS_NAME_LIST.map((name): string => {
      return t(`_materials.${name}`);
    });
  }, [t]);

  useEffect(() => {
    addCommands([t('EditElementFlow.edit')]);
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
      id: element.id,
      width: Number(data.width),
      height: Number(data.height),
      color: MATERIALS[MATERIALS_NAME_LIST[index]],
    } as ParamsType));
  }, [t, setModal, dispatch, element]);

  const addStep = useCallback((step: StepType): number => {
    const index = flow.current.length;
    flow.current = [...flow.current, step];
    addFlow({ [t('EditElementFlow.edit')]: flow.current });
    return index;
  }, [t, addFlow]);

  const replaceStep = useCallback((index: number, step?: StepType) => {
    if (step) {
      flow.current[index] = step;
    } else {
      flow.current.splice(index, 1);
    }
  }, []);

  const before = useCallback(() => {
    const count = selectedElements.length;
    if (!count) {
      return getWrite({
        value: { str: t('_common.notSelected'), className: 'ElementFlow__warn' },
        withSubmit: true,
      });
    }
    if (count > 1) {
      return getWrite({
        value: { str: t('_errors.errNotSingle'), className: 'ElementFlow__warn' },
        withSubmit: true,
      });
    }
    return undefined;
  }, [selectedElements.length, t]);

  return (
    <>
      <NumberStep
        {...props}
        before={before}
        name="width"
        minValue={MIN_SIZE}
        defaultValue={element?.width}
        write={getLabel(t('_common.enterWidthWithDefault', { defaultValue: element?.width }))}
        addStep={addStep}
        replaceStep={replaceStep}
      />
      <NumberStep
        {...props}
        name="height"
        minValue={MIN_SIZE}
        defaultValue={element?.height}
        write={getLabel(t('_common.enterHeight', { defaultValue: element?.height }))}
        addStep={addStep}
        replaceStep={replaceStep}
      />
      <ChooseStep
        {...props}
        name="material"
        values={materials}
        defaultValue={currentMaterial}
        write={getLabel(t('_common.enterMaterialWithDefault', { defaultValue: currentMaterial }))}
        addStep={addStep}
        replaceStep={replaceStep}
        onSubmit={setPosition}
      />
    </>
  );
};

export default EditElementFlow;
