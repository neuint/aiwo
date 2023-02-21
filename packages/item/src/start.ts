import { Worker } from 'worker_threads';
import path from 'path';

import { UPDATE_INTERVAL } from '../../../common/src/World/constants/parameters';
import {
  MESSAGE, COLLISION, BITE_OFF, BREAK, PUSH, PULL, COMBINE,
} from '../../../common/src/World/constants/events';

import IElement from '../../../common/src/World/elements/IElement';
import { PointType } from '../../../common/src/World/types/elemets';
import WorldBridge from './WorldBridge';
import { createElement } from './utils/element';
import {
  getWorldElementState, updateWorldElementStateViewPoints, addStateMessage, addStateCollision,
  updatePower, getActionData, checkMoveForward, checkMoveBackward, checkMoveLeft, checkMoveRight,
  checkRotateLeft, checkRotateRight, getBiteOffData, getBreakData, getPushData, getPullData,
  getCombineData, getMessageData,
} from './utils/world';

const port = process.env.PORT ? Number(process.env.PORT) : 8080;
const host = process.env.HOST || 'localhost';
const id = process.env.ID ? Number(process.env.ID) : undefined;
const workerPath = process.env.WORKER || path.join(__dirname, './rustWorker/index.js');
const itemPath = process.env.ITEM || '../../pkg/item';

const bridge = new WorldBridge(port, host);

const sendEvents = (
  element: IElement, actionData: Int32Array,
): void => {
  if (checkMoveForward(actionData)) bridge.forward(element, 1);
  if (checkMoveBackward(actionData)) bridge.back(element, 1);
  if (checkMoveLeft(actionData)) bridge.left(element, 1);
  if (checkMoveRight(actionData)) bridge.right(element, 1);
  if (checkRotateLeft(actionData)) bridge.rotateLeft(element, 1);
  if (checkRotateRight(actionData)) bridge.rotateRight(element, 1);
  const biteOffInfo = getBiteOffData(actionData);
  if (biteOffInfo.id) {
    bridge.elementAction(biteOffInfo.id, {
      action: BITE_OFF, executor: element.id, force: biteOffInfo.force,
    });
  }
  const breakInfo = getBreakData(actionData);
  if (breakInfo.id) {
    bridge.elementAction(breakInfo.id, { action: BREAK, executor: element.id });
  }
  const pushInfo = getPushData(actionData);
  if (pushInfo.id) {
    bridge.elementAction(pushInfo.id, {
      action: PUSH, executor: element.id, force: pushInfo.force,
    });
  }
  const pullInfo = getPullData(actionData);
  if (pullInfo.id) {
    bridge.elementAction(pullInfo.id, {
      action: PULL, executor: element.id, force: pullInfo.force,
    });
  }
  const combineInfo = getCombineData(actionData);
  if (combineInfo[0] && combineInfo[1]) {
    bridge.elementAction(combineInfo[0], {
      action: COMBINE, executor: element.id, additional: combineInfo[1],
    });
  }
  const messageInfo = getMessageData(actionData);
  if (messageInfo.text) {
    bridge.message(element, { text: messageInfo.text, volume: messageInfo.volume });
  }
};

const start = (element: IElement): void => {
  const { id: elementId } = element;
  const state = getWorldElementState();
  const actionData = getActionData();
  let prevCollisionPoint: PointType | undefined;
  let iterationMessages: { point: PointType; text: string }[] = [];
  let iterationCollisions: PointType[] = [];
  updateWorldElementStateViewPoints(bridge, element, state);
  updatePower(element, state);
  bridge.addEventListener(MESSAGE, (
    params: { idList: number[], message: string, sourcePoint: PointType },
  ): void => {
    const { idList } = params;
    if (!idList.includes(elementId)) return;
    const { message, sourcePoint } = params;
    iterationMessages.push({ point: sourcePoint, text: message });
  });
  bridge.addEventListener(COLLISION, (
    params: { idList: number[], point: PointType },
  ): void => {
    const { idList, point } = params;
    if (prevCollisionPoint?.x === point.x && prevCollisionPoint?.y === point.y) return;
    prevCollisionPoint = point;
    if (idList.includes(elementId)) {
      iterationCollisions.push(point);
    }
  });

  const worker = new Worker(workerPath);
  if (itemPath) worker.postMessage(itemPath);
  worker.postMessage(state);
  worker.postMessage(actionData);

  worker.addListener('message', (message: Int32Array): void => {
    const text = message.toString();
    if (text === 'iteration') {
      sendEvents(element, actionData);
    }
  });

  setInterval(() => {
    updateWorldElementStateViewPoints(bridge, element, state);
    iterationMessages.forEach((message) => {
      addStateMessage(state, message.point, message.text, element);
    });
    iterationCollisions.forEach((point) => {
      addStateCollision(state, point, element);
    });
    iterationMessages = [];
    iterationCollisions = [];
    prevCollisionPoint = undefined;
    worker.postMessage('iteration');
  }, UPDATE_INTERVAL);
};

bridge.init().then((): Promise<IElement | undefined> => {
  return id
    ? Promise.resolve(bridge.elements.find((element): boolean => element.id === id))
    : createElement(bridge);
}).then((element?: IElement) => {
  if (element) {
    start(element);
    console.log('Element id', element.id);
  } else {
    console.log('Element not found');
  }
});
