import { FC, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { noop } from 'lodash';

import IWorldBridge from '@common/World/IWorldBridge';
import WorldBridge from '@root/WorldBridge';
import { checkConnected } from '@ducks/connection/selectors';
import {
  ADD_ELEMENT, REMOVE_ELEMENT, UPDATE_ELEMENT, COLLISION, MESSAGE, REINIT,
} from '@common/World/constants/events';
import {
  worldSet, worldNew, worldRemove, worldEdit, worldAddCollision, worldAddMessage,
} from '@ducks/world';
import { BaseParamsType, PointType, ElementMessageType } from '@common/World/types/elemets';

const World: FC = () => {
  const dispatch = useDispatch();
  const connected = useSelector(checkConnected);
  const bridge = useRef<IWorldBridge | undefined>();

  const addElementHandler = useCallback((params: BaseParamsType) => {
    dispatch(worldNew(params));
  }, [dispatch]);

  const removeElementHandler = useCallback((id: number) => {
    dispatch(worldRemove(id));
  }, [dispatch]);

  const updateElementHandler = useCallback((params: BaseParamsType) => {
    dispatch(worldEdit(params));
  }, [dispatch]);

  const collisionHandler = useCallback((params: { idList: number[], point: PointType }) => {
    dispatch(worldAddCollision(params));
  }, [dispatch]);

  const messageHandler = useCallback((message: ElementMessageType) => {
    dispatch(worldAddMessage(message));
  }, [dispatch]);

  const reinit = useCallback(() => {
    if (!bridge.current) return;
    dispatch(worldSet(bridge.current.elements.map((e) => e.params)));
  }, [dispatch]);

  const initHandler = useCallback(() => {
    if (!bridge.current) return noop;
    bridge.current.addEventListener(REINIT, reinit);
    bridge.current.addEventListener(ADD_ELEMENT, addElementHandler);
    bridge.current.addEventListener(REMOVE_ELEMENT, removeElementHandler);
    bridge.current.addEventListener(UPDATE_ELEMENT, updateElementHandler);
    bridge.current.addEventListener(COLLISION, collisionHandler);
    bridge.current.addEventListener(MESSAGE, messageHandler);
    return () => {
      if (bridge.current) {
        bridge.current.removeEventListener(REINIT, reinit);
        bridge.current.removeEventListener(ADD_ELEMENT, addElementHandler);
        bridge.current.removeEventListener(REMOVE_ELEMENT, removeElementHandler);
        bridge.current.removeEventListener(UPDATE_ELEMENT, updateElementHandler);
        bridge.current.removeEventListener(COLLISION, collisionHandler);
        bridge.current.removeEventListener(MESSAGE, messageHandler);
      }
    };
  }, [
    addElementHandler, removeElementHandler, updateElementHandler, collisionHandler, messageHandler,
    reinit,
  ]);

  useEffect(() => {
    if (!connected) return noop;
    bridge.current = WorldBridge.get();
    if (!bridge.current) return noop;
    bridge.current.init().then(() => {
      if (bridge.current) {
        dispatch(worldSet(bridge.current.elements.map((e) => e.params)));
        initHandler();
      }
    });
    return noop;
  }, [connected, initHandler, dispatch]);

  return null;
};

export default World;
