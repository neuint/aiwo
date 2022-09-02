import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as THREE from 'three';
import { noop } from 'lodash';

import { RED_COLOR } from '@common/World/constants/color';
import { PointType } from '@common/World/types/elemets';
import { getGlobal } from '@common/utils/point';
import { getRadians } from '@common/utils/angle';
import { worldRemoveCollision } from '@ducks/world';
import { getControlElement } from '@ducks/world/selectors';

type PropsType = {
  point: PointType;
  scene: THREE.Scene;
};

const WorldElementCollisionDot: FC<PropsType> = ({ point, scene }: PropsType) => {
  const dispatch = useDispatch();
  const controlElementParams = useSelector(getControlElement);

  useEffect(() => {
    const timeout = setTimeout(() => {
      dispatch(worldRemoveCollision(point));
    }, 1000);
    return () => {
      clearTimeout(timeout);
    };
  }, [dispatch, point]);

  useEffect(() => {
    if (!controlElementParams) return noop;
    const { x, y } = getGlobal(
      point, controlElementParams, getRadians(controlElementParams.angle || 0),
    );
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute([x, y, 0], 3));
    const material = new THREE.PointsMaterial({ color: RED_COLOR, size: 5 });
    const targetPoints = new THREE.Points(geometry, material);
    scene.add(targetPoints);
    return () => {
      scene.remove(targetPoints);
    };
  }, [scene, controlElementParams, point]);
  return null;
};

export default WorldElementCollisionDot;
