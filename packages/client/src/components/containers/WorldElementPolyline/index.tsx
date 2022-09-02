import { FC, useEffect } from 'react';
import { useSelector } from 'react-redux';
import * as THREE from 'three';

import IElement from '@common/World/elements/IElement';
import { getControlId } from '@ducks/world/selectors';

type PropsType = {
  index?: number;
  scene: THREE.Scene;
  element: IElement;
  onRender?: (uuid: string) => void;
};

const WorldElementPolyline: FC<PropsType> = ({ index, scene, element, onRender }: PropsType) => {
  const controlId = useSelector(getControlId);
  useEffect(() => {
    const { params: { color }, polygon } = element;
    const shape = new THREE.Shape();
    polygon.forEach(({ x, y }, i) => {
      if (i === 0) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }
    });
    const mesh = new THREE.Mesh(
      new THREE.ShapeGeometry(shape),
      new THREE.MeshBasicMaterial({
        color,
        wireframe: true,
        opacity: controlId && element.id !== controlId ? 0.3 : 1,
        transparent: true,
      }),
    );
    scene.add(mesh);
    if (onRender) onRender(mesh.uuid);
    return () => {
      scene.remove(mesh);
    };
  }, [scene, element, index, onRender, controlId]);
  return null;
};

export default WorldElementPolyline;
