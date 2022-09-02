import { FC, useEffect } from 'react';
import { noop } from 'lodash';
import * as THREE from 'three';

import IElement from '@common/World/elements/IElement';
import appConfig from '@root/appConfig.json';

type PropsType = {
  index?: number;
  scene: THREE.Scene;
  element: IElement;
};

const WorldElementBorderBox: FC<PropsType> = ({ index, scene, element }: PropsType) => {
  useEffect(() => {
    if (!appConfig.feature.elementBorderBox) return noop;
    const { params: { x = 0, y = 0, color }, box: { width, height } } = element;
    const material = new THREE.LineDashedMaterial({ color });
    const points = [
      new THREE.Vector3(x + width / 2, y + height / 2, 0),
      new THREE.Vector3(x + width / 2, y - height / 2, 0),
      new THREE.Vector3(x - width / 2, y - height / 2, 0),
      new THREE.Vector3(x - width / 2, y + height / 2, 0),
      new THREE.Vector3(x + width / 2, y + height / 2, 0),
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    scene.add(line);
    return () => {
      scene.remove(line);
    };
  }, [scene, element, index]);
  return null;
};

export default WorldElementBorderBox;
