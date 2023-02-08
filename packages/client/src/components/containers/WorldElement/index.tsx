import React, { FC, useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as THREE from 'three';

import Box from '@common/World/elements/Box';
import IElement from '@common/World/elements/IElement';
import { checkSelected, getElementById, getCollisionPoints, getControlId } from '@ducks/world/selectors';
import { worldToggleSelection, worldAddHover, worldRemoveHover } from '@ducks/world';
import StateType from '@ducks/StateType';
import useMouseInfo from '@root/hooks/useMouseInfo';
import WorldElementBorderBox from '../WorldElementBorderBox';
import WorldElementPolyline from '../WorldElementPolyline';
import WorldElementSelected from '../WorldElementSelected';
import WorldElementTargetDot from '../WorldElementTargetDot';
import WorldElementCollisionDot from '../WorldElementCollisionDot';
import WorldElementViewZoneDots from '../WorldElementViewZoneDots';

type PropsType = {
  id: number;
  scene: THREE.Scene;
};

const WorldElement: FC<PropsType> = ({ id, scene }: PropsType) => {
  const [index, setIndex] = useState(0);
  const [uuid, setUuid] = useState<string>('');
  const dispatch = useDispatch();
  const params = useSelector((state: StateType) => getElementById(state, id));
  const [element, setElement] = useState<IElement | undefined>();
  const selected = useSelector((state: StateType) => checkSelected(state, id));
  const controlId = useSelector(getControlId);
  const collisionPoints = useSelector(getCollisionPoints);
  const isControlledElement = controlId === id;

  const [isHovered, isClicked] = useMouseInfo(uuid);

  const renderHandler = useCallback((renderUuid: string) => {
    setUuid(renderUuid);
  }, []);

  useEffect(() => {
    if (isControlledElement) return;
    if (isHovered) {
      dispatch(worldAddHover(id));
    } else {
      dispatch(worldRemoveHover(id));
    }
  }, [id, dispatch, isHovered, isControlledElement]);

  useEffect(() => () => {
    dispatch(worldRemoveHover(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (isControlledElement) dispatch(worldRemoveHover(id));
  }, [id, dispatch, isControlledElement]);

  useEffect(() => {
    if (element && params) {
      element.updateParams(params);
      setIndex((i) => i + 1);
    } else if (params) {
      setElement(params ? new Box(params.id || -1, params) : undefined);
    } else {
      setElement(undefined);
    }
  }, [params, setElement, element]);

  useEffect(() => {
    if (isClicked && !isControlledElement) {
      dispatch(worldToggleSelection(id));
    }
  }, [dispatch, isClicked, id, isControlledElement]);

  // console.log('WorldElement', id);

  return element ? (
    <>
      <WorldElementBorderBox index={index} element={element} scene={scene} />
      <WorldElementPolyline
        index={index}
        element={element}
        scene={scene}
        onRender={renderHandler}
      />
      <WorldElementSelected index={index} element={element} scene={scene} />
      {(isHovered && !isControlledElement) || selected ? (
        <WorldElementTargetDot index={index} element={element} scene={scene} />
      ) : null}
      {isControlledElement ? (
        <WorldElementViewZoneDots element={element} scene={scene} />
      ) : null}
      {isControlledElement ? collisionPoints.map((point) => {
        return (
          <WorldElementCollisionDot key={`${point.x}-${point.y}`} point={point} scene={scene} />
        );
      }) : null}
    </>
  ) : null;
};

export default WorldElement;
