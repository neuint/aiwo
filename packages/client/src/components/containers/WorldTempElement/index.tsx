import React, { FC, useEffect, useState, useContext } from 'react';
import { useSelector } from 'react-redux';
import * as THREE from 'three';

import Box from '@common/World/elements/Box';
import IElement from '@common/World/elements/IElement';
import { getTempElement } from '@root/ducks/world/selectors';
import WorldPosition from '@context/WorldPosition';
import WorldElementBorderBox from '../WorldElementBorderBox';
import WorldElementPolyline from '../WorldElementPolyline';

type PropsType = {
  scene: THREE.Scene;
};

const WorldTempElement: FC<PropsType> = ({ scene }: PropsType) => {
  const [index, setIndex] = useState(0);
  const position = useContext(WorldPosition);
  const params = useSelector(getTempElement);
  const [element, setElement] = useState<IElement | undefined>();

  useEffect(() => {
    if (element && params && position) {
      element.updateParams({ ...params, ...position });
      setIndex((i) => i + 1);
    } else if (params) {
      setElement(params ? new Box(params.id || -1, params) : undefined);
    } else {
      setElement(undefined);
    }
  }, [params, setElement, element, position]);

  return element ? (
    <>
      <WorldElementBorderBox index={index} element={element} scene={scene} />
      <WorldElementPolyline index={index} element={element} scene={scene} />
    </>
  ) : null;
};

export default WorldTempElement;
