import { useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import * as THREE from 'three';
import isRetina from 'is-retina';

import * as worldSelectors from '@root/ducks/world/selectors';
import { BaseParamsType } from '@common/World/types/elemets';
import { checkBoxesCollision } from '@common/utils/box';

const EMPTY: number[] = [];

const useViewportElements = (
  camera: { current?: THREE.OrthographicCamera },
  container: { current: HTMLDivElement | null },
): number[] => {
  const elements = useSelector(worldSelectors.getElements);
  const out = useSelector(worldSelectors.getOut);
  const scale = useRef(isRetina() ? 2 : 1);
  const { x, y } = camera?.current?.position || { x: 0, y: 0 };
  const idList = useMemo(() => {
    if (!camera.current || !container.current) return EMPTY;
    const root = container.current as HTMLDivElement;
    const scaleValue = scale.current;
    const { width, height } = root.getBoundingClientRect();
    const size = Math.max(width, height);
    const viewportBox = {
      startX: x - (size / scaleValue) * out,
      endX: x + (size / scaleValue) * out,
      startY: y - (size / scaleValue) * out,
      endY: y + (size / scaleValue) * out,
    };
    return Object.keys(elements).filter((id: string) => {
      const element = elements[parseInt(id, 10)] as BaseParamsType & {
        width: number; height: number;
      };
      const elementBox = {
        startX: element.x - element.width / 2,
        endX: element.x + element.width / 2,
        startY: element.y - element.height / 2,
        endY: element.y + element.height / 2,
      };

      return checkBoxesCollision(elementBox, viewportBox);
    }).map((id: string) => parseInt(id, 10));
  }, [camera, container, x, out, y, elements]);
  return idList;
};

export default useViewportElements;
