/* eslint-disable no-param-reassign */
import IElement from '../../../../common/src/World/elements/IElement';
import IWorldBridge from '../../../../common/src/World/IWorldBridge';
import { MATERIALS } from '../../../../common/src/constants/materials';
import { getViewPointsOfElements } from '../../../../common/src/utils/world';
import { getLocal } from '../../../../common/src/utils/point';
import { VIEW_ZONE_ANGLE, VIEW_ZONE_ANGLE_POINTS_STEP } from '../../../../common/src/World/constants/parameters';
import { ElementPointType, PointType } from '../../../../common/src/World/types/elemets';

const VIEW_ZONE_POINT_INFO_LENGTH = 5;
const MESSAGE_MAX_LENGTH = 122;
const MESSAGE_INFO_LENGTH = MESSAGE_MAX_LENGTH + 3;
const COLLISION_INFO_LENGTH = 3;
const POWER_INFO_LENGTH = 1;

const VIEW_ZONE_POINTS_COUNT = Math.floor((2 * VIEW_ZONE_ANGLE) / VIEW_ZONE_ANGLE_POINTS_STEP);
const COLLISION_POINTS_COUNT = 100;
const MESSAGES_COUNT = 100;

const MATERIALS_LIST = Object.keys(MATERIALS).sort();

const MOVE_ACTION_INFO_LENGTH = 1;
const ON_ELEMENT_ACTION_INFO_LENGTH = 2;
const ON_ELEMENTS_ACTION_INFO_LENGTH = 3;
const MESSAGE_ACTION_INFO_LENGTH = MESSAGE_MAX_LENGTH;

const getExportNumber = (value: number): number => {
  return Math.round(value * 1000);
};

const getImportForce = (value: number): number => {
  return value / 100;
};

export const getMaterialId = (material: string): number => {
  const index = MATERIALS_LIST.findIndex((name: string) => {
    return material === MATERIALS[name];
  });
  return index === -1 ? MATERIALS_LIST.length : index;
};

export const getMaterialName = (id: number): string => {
  return MATERIALS[MATERIALS_LIST[id]];
};

export const getWorldElementState = (): Int32Array => {
  const count = VIEW_ZONE_POINTS_COUNT * VIEW_ZONE_POINT_INFO_LENGTH
    + COLLISION_POINTS_COUNT * COLLISION_INFO_LENGTH
    + MESSAGES_COUNT * MESSAGE_INFO_LENGTH
    + POWER_INFO_LENGTH;
  return new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * count));
};

export const updatePower = (element: IElement, state: Int32Array): void => {
  state[0] = element.power;
};

export const updateWorldElementStateViewPoints = (
  bridge: IWorldBridge, element: IElement, state: Int32Array,
): void => {
  const { elements } = bridge;
  const { angle = 0 } = element.params;
  const points = getViewPointsOfElements(element, elements);
  let lastIndex = 0;
  points.forEach((point: ElementPointType, index: number): void => {
    if (index < VIEW_ZONE_POINTS_COUNT) {
      const { id = 0, color = '', viewZone } = point;
      const { x, y } = getLocal(point, element.params, angle);
      const startIndex = POWER_INFO_LENGTH + index * VIEW_ZONE_POINT_INFO_LENGTH;
      state[startIndex] = id;
      state[startIndex + 1] = getExportNumber(x);
      state[startIndex + 2] = getExportNumber(y);
      state[startIndex + 3] = getMaterialId(color);
      state[startIndex + 4] = viewZone ? 1 : 0;
      lastIndex = startIndex;
    }
  });
  if (lastIndex < VIEW_ZONE_POINTS_COUNT) {
    for (let i = lastIndex + 1; i <= VIEW_ZONE_POINTS_COUNT; i += 1) {
      const startIndex = i * VIEW_ZONE_POINT_INFO_LENGTH;
      state[startIndex] = 0;
      state[startIndex + 1] = 0;
      state[startIndex + 2] = 0;
      state[startIndex + 3] = 0;
      state[startIndex + 4] = 0;
    }
  }
};

export const addStateMessage = ((): (
  state: Int32Array, point: PointType, message: string, element: IElement,
) => void => {
  const firstIndex = POWER_INFO_LENGTH
    + VIEW_ZONE_POINTS_COUNT * VIEW_ZONE_POINT_INFO_LENGTH;

  const getEmptyIndex = (state: Int32Array): number => {
    for (let i = 0; i < MESSAGES_COUNT; i += 1) {
      const index = firstIndex + i * MESSAGE_INFO_LENGTH;
      if (!state[firstIndex]) return index;
    }
    return -1;
  };

  return (
    state: Int32Array, point: PointType, message: string, element: IElement,
  ): void => {
    const startIndex = getEmptyIndex(state);
    const { angle = 0 } = element.params;
    if (startIndex < 0) return;

    const { x, y } = getLocal(point, element.params, angle);
    state[startIndex] = 1;
    state[startIndex + 1] = getExportNumber(x);
    state[startIndex + 2] = getExportNumber(y);
    message.split('').forEach((char: string, index: number): void => {
      if (index >= MESSAGE_MAX_LENGTH) return;
      const code = char.charCodeAt(0);
      state[startIndex + 3 + index] = code;
    });
  };
})();

export const addStateCollision = ((): (
  state: Int32Array, point: PointType, element: IElement,
) => void => {
  const firstIndex = POWER_INFO_LENGTH
    + VIEW_ZONE_POINTS_COUNT * VIEW_ZONE_POINT_INFO_LENGTH
    + MESSAGES_COUNT * MESSAGE_INFO_LENGTH;

  const getEmptyIndex = (state: Int32Array): number => {
    for (let i = 0; i < COLLISION_POINTS_COUNT; i += 1) {
      const index = firstIndex + i * COLLISION_INFO_LENGTH;
      if (!state[firstIndex]) return index;
    }
    return -1;
  };

  return (
    state: Int32Array, point: PointType, element: IElement,
  ): void => {
    const startIndex = getEmptyIndex(state);
    const { angle = 0 } = element.params;
    if (startIndex < 0) return;
    const { x, y } = getLocal(point, element.params, angle);
    state[startIndex] = 1;
    state[startIndex + 1] = getExportNumber(x);
    state[startIndex + 2] = getExportNumber(y);
  };
})();

export const getActionData = (): Int32Array => {
  const count = MOVE_ACTION_INFO_LENGTH * 6
    + ON_ELEMENT_ACTION_INFO_LENGTH * 4
    + ON_ELEMENTS_ACTION_INFO_LENGTH * 1
    + MESSAGE_ACTION_INFO_LENGTH;
  return new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * count));
};

export const checkMoveForward = (actionData: Int32Array): boolean => {
  return actionData[MOVE_ACTION_INFO_LENGTH * 0] === 1;
};

export const checkMoveBackward = (actionData: Int32Array): boolean => {
  return actionData[MOVE_ACTION_INFO_LENGTH * 1] === 1;
};

export const checkRotateLeft = (actionData: Int32Array): boolean => {
  return actionData[MOVE_ACTION_INFO_LENGTH * 2] === 1;
};

export const checkRotateRight = (actionData: Int32Array): boolean => {
  return actionData[MOVE_ACTION_INFO_LENGTH * 3] === 1;
};

export const checkMoveLeft = (actionData: Int32Array): boolean => {
  return actionData[MOVE_ACTION_INFO_LENGTH * 4] === 1;
};

export const checkMoveRight = (actionData: Int32Array): boolean => {
  return actionData[MOVE_ACTION_INFO_LENGTH * 5] === 1;
};

export const getBiteOffData = (actionData: Int32Array): { id: number; force: number } => {
  const startIndex = MOVE_ACTION_INFO_LENGTH * 6 + ON_ELEMENT_ACTION_INFO_LENGTH * 0;
  return {
    id: actionData[startIndex],
    force: getImportForce(actionData[startIndex + 1]),
  };
};

export const getBreakData = (actionData: Int32Array): { id: number; force: number } => {
  const startIndex = MOVE_ACTION_INFO_LENGTH * 6 + ON_ELEMENT_ACTION_INFO_LENGTH * 1;
  return {
    id: actionData[startIndex],
    force: getImportForce(actionData[startIndex + 1]),
  };
};

export const getPushData = (actionData: Int32Array): { id: number; force: number } => {
  const startIndex = MOVE_ACTION_INFO_LENGTH * 6 + ON_ELEMENT_ACTION_INFO_LENGTH * 2;
  return {
    id: actionData[startIndex],
    force: getImportForce(actionData[startIndex + 1]),
  };
};

export const getPullData = (actionData: Int32Array): { id: number; force: number } => {
  const startIndex = MOVE_ACTION_INFO_LENGTH * 6 + ON_ELEMENT_ACTION_INFO_LENGTH * 3;
  return {
    id: actionData[startIndex],
    force: getImportForce(actionData[startIndex + 1]),
  };
};

export const getCombineData = (actionData: Int32Array): [number, number] => {
  const startIndex = MOVE_ACTION_INFO_LENGTH * 6
    + ON_ELEMENT_ACTION_INFO_LENGTH * 4
    + ON_ELEMENTS_ACTION_INFO_LENGTH * 0;
  return [actionData[startIndex], actionData[startIndex + 1]];
};

export const getMessageData = (actionData: Int32Array): {
  text: string;
  volume: number;
} => {
  const startIndex = MOVE_ACTION_INFO_LENGTH * 6
    + ON_ELEMENT_ACTION_INFO_LENGTH * 4
    + ON_ELEMENTS_ACTION_INFO_LENGTH * 1;
  const message = [];
  for (let i = 0; i < MESSAGE_MAX_LENGTH; i += 1) {
    const code = actionData[startIndex + i];
    message.push(code ? String.fromCharCode(actionData[startIndex + i]) : '');
  }
  return {
    text: message.join(''),
    volume: actionData[startIndex + MESSAGE_MAX_LENGTH] / 100,
  };
};
