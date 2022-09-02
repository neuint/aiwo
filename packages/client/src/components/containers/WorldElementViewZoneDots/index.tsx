import { FC, useEffect } from 'react';
import { noop } from 'lodash';
import { useSelector } from 'react-redux';
import * as THREE from 'three';

import IElement from '@common/World/elements/IElement';
import { getViewPointsOfElements } from '@common/utils/world';
import { GREEN_COLOR } from '@common/World/constants/color';
import { getControlElement, getChangeIndex } from '@ducks/world/selectors';
import WorldBridge from '@root/WorldBridge';

type PropsType = {
  element: IElement;
  scene: THREE.Scene;
};

const WorldElementViewZoneDots: FC<PropsType> = ({ element, scene }: PropsType) => {
  const controlElement = useSelector(getControlElement);
  const changeIndex = useSelector(getChangeIndex);
  useEffect(() => {
    if (element.id !== controlElement?.id) return noop;
    const bridge = WorldBridge.get();
    const points = getViewPointsOfElements(element, bridge.elements);
    const scenePoints: THREE.Points[] = [];
    const vertices: { [key: string]: number[] } = points
      .reduce((acc, { x, y, color = GREEN_COLOR }) => {
        if (!acc[color]) acc[color] = [];
        acc[color].push(x, y, 0);
        return acc;
      }, {} as { [key: string]: number[] });
    Object.keys(vertices).forEach((color) => {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices[color], 3));
      const material = new THREE.PointsMaterial({ color, size: 3 });
      const item = new THREE.Points(geometry, material);
      scenePoints.push(item);
      scene.add(item);
    });
    return () => {
      scenePoints.forEach((removeItem) => {
        scene.remove(removeItem);
      });
    };
  }, [element, controlElement, scene, changeIndex]);
  return null;
};

export default WorldElementViewZoneDots;
