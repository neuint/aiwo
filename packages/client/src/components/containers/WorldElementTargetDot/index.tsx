import { FC, useEffect } from 'react';
import * as THREE from 'three';

import IElement from '@common/World/elements/IElement';
import { YELLOW_COLOR } from '@common/World/constants/color';

type PropsType = {
  index?: number;
  scene: THREE.Scene;
  element: IElement;
};

const WorldElementHoverTargetDot: FC<PropsType> = ({ index, scene, element }: PropsType) => {
  useEffect(() => {
    const { params: { x, y } } = element;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute([x, y, 0], 3));
    const material = new THREE.PointsMaterial({ color: YELLOW_COLOR, size: 5 });
    const targetPoints = new THREE.Points(geometry, material);
    scene.add(targetPoints);
    return () => {
      scene.remove(targetPoints);
    };
  }, [scene, element, index]);
  return null;
};

export default WorldElementHoverTargetDot;
