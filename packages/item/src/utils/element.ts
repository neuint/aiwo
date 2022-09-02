import { v4 } from 'uuid';

import IElement from '../../../../common/src/World/elements/IElement';
import { ADD_ELEMENT } from '../../../../common/src/World/constants/events';
import IWorldBridge from '../../../../common/src/World/IWorldBridge';
import { MATERIALS } from '../../../../common/src/constants/materials';
import { BaseParamsType } from '../../../../common/src/World/types/elemets';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '../constants/element';

export const createElement = (bridge: IWorldBridge): Promise<IElement> => {
  let x = 0;
  let y = 0;
  bridge.elements.forEach((element: IElement) => {
    const { boxCoordinates } = element;
    if (boxCoordinates.startY < y) y = boxCoordinates.startY;
    if (boxCoordinates.startX < x) x = boxCoordinates.startX;
  });
  const label = v4();
  bridge.addElement({
    label,
    x: x - Math.ceil(DEFAULT_WIDTH / 2) - 1,
    y: y - Math.ceil(DEFAULT_HEIGHT / 2) - 1,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    color: MATERIALS.PERSON_MATERIAL,
  } as BaseParamsType);

  return new Promise((resolve) => {
    bridge.addEventListener(ADD_ELEMENT, (params: BaseParamsType) => {
      if (params.label === label) {
        const element = bridge.elements.find((e: IElement) => e.params.label === label);
        if (element) resolve(element);
      }
    });
  });
};
