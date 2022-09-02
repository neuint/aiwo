import { FC, useEffect } from 'react';
import * as THREE from 'three';

import IElement from '@common/World/elements/IElement';
import { GREEN_COLOR } from '@common/World/constants/color';

type PropsType = {
  index?: number;
  scene: THREE.Scene;
  element: IElement;
};

const WorldElementSelected: FC<PropsType> = ({ index, scene, element }: PropsType) => {
  useEffect(() => {
    const { polygon } = element;
    const material = new THREE.MeshBasicMaterial({ color: GREEN_COLOR, opacity: 0.02 });
    const shape = new THREE.Shape();
    polygon.forEach(({ x: ix = 0, y: iy = 0 }, i) => {
      if (i === 0) {
        shape.moveTo(ix, iy);
      } else {
        shape.lineTo(ix, iy);
      }
    });
    const geometry = new THREE.ShapeGeometry(shape);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    return () => {
      scene.remove(mesh);
    };
  }, [scene, element, index]);
  return null;
};

export default WorldElementSelected;
