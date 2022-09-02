import React, { FC, useEffect, useCallback, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPortal } from 'react-dom';
import { FlowType, StepType } from '@neuint/flows-plugin';

import { ParamsType } from '@common/World/elements/Box/types';
import { BITE_OFF, BREAK, PUSH, PULL, COMBINE } from '@common/World/constants/actions';
import { UPDATE_INTERVAL } from '@common/World/constants/parameters';
import { CommonPropsType } from '@root/components/_flows/types';
import useTranslation from '@hooks/useTranslation';
import { worldControl, worldStopControl, worldClearSelection, worldToggleSelection } from '@ducks/world';
import { getFirstSelected, getSelected } from '@ducks/world/selectors';
import WorldBridge from '@root/WorldBridge';
import { MESSAGE_PORTAL_ID } from '@root/constants/portal';
import ExecutionStep from '../../_steps/ExecutionStep';
import { getError } from '../../_utils/write';
import ElementControlFlowModal from './Modal';
import ElementControlFlowMessage from './Message';

const ElementControlFlow: FC<CommonPropsType> = (props: CommonPropsType) => {
  const { addFlow, addCommands, setModal } = props;
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const flow = useRef<FlowType>([]);
  const intervalInfo = useRef<{ [key: string]: ReturnType<typeof setInterval> }>({});
  const elementId = useRef<number>(0);
  const selectedElements = useSelector(getSelected);
  const element = useSelector(getFirstSelected) as ParamsType;
  const isModalOpen = useRef(false);
  const selectedElementsRef = useRef(selectedElements);
  const [writing, setWriting] = useState(false);

  useEffect(() => {
    selectedElementsRef.current = selectedElements;
  }, [selectedElements]);

  useEffect(() => {
    addCommands([t('ElementControlFlow.control')]);
  }, [t, addCommands]);

  const stopActions = useCallback(() => {
    Object.values(intervalInfo.current).forEach(clearInterval);
    intervalInfo.current = {};
  }, []);

  const stopAction = useCallback((
    action: 'forward' | 'backward' | 'clockwise' | 'counterClockwise' | 'left' | 'right',
  ) => {
    if (intervalInfo.current[action]) {
      clearInterval(intervalInfo.current[action]);
      delete intervalInfo.current[action];
    }
  }, []);

  const startAction = useCallback((
    action: 'forward' | 'backward' | 'clockwise' | 'counterClockwise' | 'left' | 'right',
  ) => {
    const bridge = WorldBridge.get();
    const id = elementId.current;
    stopAction(action);
    if (!id) return;
    intervalInfo.current[action] = setInterval(() => {
      if (action === 'forward') bridge.forward(id, 1);
      if (action === 'backward') bridge.back(id, 1);
      if (action === 'clockwise') bridge.rotateLeft(id, 1);
      if (action === 'counterClockwise') bridge.rotateRight(id, 1);
      if (action === 'left') bridge.left(id, 1);
      if (action === 'right') bridge.right(id, 1);
    }, UPDATE_INTERVAL);
  }, [stopAction]);

  const elementAction = useCallback((type: 'biteOff' | 'break' | 'push' | 'pull' | 'combine') => {
    const bridge = WorldBridge.get();
    const { length } = selectedElementsRef.current;
    if (length === 1 || (type === COMBINE && length === 2)) {
      bridge.elementAction(selectedElementsRef.current[0], {
        action: type,
        executor: elementId.current,
        additional: type === COMBINE ? selectedElementsRef.current[1] : undefined,
      });
    }
  }, []);

  const messageHandler = useCallback((message: string) => {
    const bridge = WorldBridge.get();
    const id = elementId.current;
    if (!id) return;
    bridge.message(id, { text: message, volume: 1 });
    setWriting(false);
  }, [setWriting]);

  useEffect(() => {
    const downHandler = (ev: KeyboardEvent): void => {
      const key = ev.key.toLowerCase();

      if (key === 'escape' && writing) setWriting(false);
      if (writing) return;
      if (key === 'escape') dispatch(worldClearSelection());
      if (key === 'w' && !ev.shiftKey) startAction('forward');
      if (key === 's' && !ev.shiftKey) startAction('backward');
      if (key === 'd' && !ev.shiftKey) startAction('clockwise');
      if (key === 'a' && !ev.shiftKey) startAction('counterClockwise');
      if (key === 'd' && ev.shiftKey) startAction('right');
      if (key === 'a' && ev.shiftKey) startAction('left');
      if (key === 'w' && ev.shiftKey) elementAction(PUSH);
      if (key === 's' && ev.shiftKey) elementAction(PULL);
      if (key === 'q') elementAction(BITE_OFF);
      if (key === 'e') elementAction(BREAK);
      if (key === ' ') elementAction(COMBINE);
      if (key === 't') setWriting(true);
    };
    const upHandler = (ev: KeyboardEvent): void => {
      const key = ev.key.toLowerCase();
      if (key === 'w') stopAction('forward');
      if (key === 's') stopAction('backward');
      if (key === 'd') {
        stopAction('clockwise');
        stopAction('right');
      }
      if (key === 'a') {
        stopAction('counterClockwise');
        stopAction('left');
      }
    };
    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);
    window.addEventListener('mouseleave', stopActions);
    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
      window.removeEventListener('mouseleave', stopActions);
    };
  }, [startAction, stopActions, stopAction, elementAction, dispatch, writing]);

  const startControl = useCallback((id: number) => {
    dispatch(worldControl(id));
    dispatch(worldClearSelection());
    elementId.current = id;
    const closeHandler = (): void => {
      if (!isModalOpen.current) return;
      isModalOpen.current = false;
      elementId.current = 0;
      dispatch(worldStopControl());
      dispatch(worldClearSelection());
      dispatch(worldToggleSelection(id));
      setModal();
    };
    setModal(
      <ElementControlFlowModal onClose={closeHandler} />,
    );
    isModalOpen.current = true;
  }, [dispatch, setModal]);

  const addStep = useCallback((step: StepType): number => {
    const index = flow.current.length;
    flow.current = [...flow.current, step];
    addFlow({ [t('ElementControlFlow.control')]: flow.current });
    return index;
  }, [t, addFlow]);

  const replaceStep = useCallback((index: number, step?: StepType) => {
    if (step) {
      flow.current[index] = step;
    } else {
      flow.current.splice(index, 1);
    }
  }, []);

  const controlHandler = useCallback(() => {
    if (selectedElements.length > 1) {
      return Promise.resolve({ write: getError(t('_errors.errNotSingle')) });
    }
    if (!element?.id) {
      return Promise.resolve({ write: getError(t('_common.notSelected')) });
    }
    startControl(element.id);
    return Promise.resolve(undefined);
  }, [selectedElements.length, element?.id, startControl, t]);

  return (
    <>
      {writing ? createPortal(
        <ElementControlFlowMessage onSubmit={messageHandler} />,
        document.querySelector(`#${MESSAGE_PORTAL_ID}`) as HTMLDivElement,
      ) : null}
      <ExecutionStep
        {...props}
        name="control"
        execute={controlHandler}
        addStep={addStep}
        replaceStep={replaceStep}
      />
    </>
  );
};

export default ElementControlFlow;
