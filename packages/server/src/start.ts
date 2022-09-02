import { isNumber, isUndefined, isString } from 'lodash';

import Server from './Server';
import * as EVENTS from './Server/constants/events';
import appConfig from './utils/appConfig';
import World from '../../../common/src/World';
import { elementFactory } from '../../../common/src/World/elements';
import {
  ADD_ELEMENT, BACK, COLLISION, FORWARD, INIT, REMOVE_ELEMENT, ROTATE_LEFT, ROTATE_RIGHT, UPDATE_ELEMENT, VIEW_ANGLE,
  COMBINE, BREAK, BITE_OFF, PUSH, PULL, MESSAGE, LEFT, RIGHT,
} from '../../../common/src/World/constants/events';
import IElement from '../../../common/src/World/elements/IElement';
import { BaseParamsType } from '../../../common/src/World/types/elemets';
import { MAX_LINE_STEP, MAX_ROTATION_STEP } from '../../../common/src/World/constants/parameters';
import { VIEW_ZONE_ROTATE_MAX } from '../../../common/src/World/constants/parameters';

const COLOR_PATTERN = /^#[0-9a-f]{6}$/i;
const CHECK = {
  viewAngle: (data: any): boolean => {
    return isNumber(data) && data < 180 ? data <= VIEW_ZONE_ROTATE_MAX : data >= 360 - VIEW_ZONE_ROTATE_MAX;
  },

  angle: (data: any): boolean => {
    return isNumber(data) && data >= 0 && data <= 360;
  },

  id: (data: any): boolean => {
    return isNumber(data) && data > 0;
  },

  force: (data: any): boolean => {
    return isNumber(data) && data > 0 && data <= 1;
  },

  volume: (data: any): boolean => {
    return isNumber(data) && data > 0 && data <= 1;
  },

  text: (data: any): boolean => {
    return isString(data) && data.length > 0;
  },

  lineStep: (data: any): boolean => {
    return isNumber(data) && Math.abs(data) > 0 && Math.abs(data) <= MAX_LINE_STEP;
  },

  rotateStep: (data: any): boolean => {
    return isNumber(data) && Math.abs(data) > 0 && Math.abs(data) <= MAX_ROTATION_STEP;
  },

  params: (data: any): boolean => {
    if (!isNumber(data?.x) || !isNumber(data?.y)) return false;
    if (!isUndefined(data?.color) && isString(data?.color) && !COLOR_PATTERN.test(data?.color)) return false;
    if (!isUndefined(data?.id) && !CHECK.id(data?.id)) return false;
    if (!isUndefined(data?.angle) && !CHECK.angle(data?.angle)) return false;
    if (!isUndefined(data?.viewAngle) && !CHECK.viewAngle(data?.viewAngle)) return false;
    if (!isUndefined(data?.label) && !isString(data?.label)) return false;
    return true;
  },
};

const world = new World();
const server = new Server(appConfig.server.port);

world.addEventListener(ADD_ELEMENT, (element: IElement) => {
  server.broadcast(JSON.stringify({ type: ADD_ELEMENT, params: element.params }));
});

world.addEventListener(REMOVE_ELEMENT, (id: number) => {
  server.broadcast(JSON.stringify({ type: REMOVE_ELEMENT, id }));
});

world.addEventListener(UPDATE_ELEMENT, (id: number) => {
  const element = world.getElement(id);
  if (element) server.broadcast(JSON.stringify({ type: UPDATE_ELEMENT, id, params: element.params }));
});

world.addEventListener(COLLISION, (params) => {
  server.broadcast(JSON.stringify({ type: COLLISION, params }));
});

world.addEventListener(MESSAGE, (params) => {
  server.broadcast(JSON.stringify({ type: MESSAGE, params }));
});

server.init().then(() => {
  console.log('Done');
});

server.addListener(EVENTS.CONNECT, ({ id }) => {
  server.send(id, JSON.stringify({ type: INIT, elementParamList: world.elementParamList }));
});


server.addListener(EVENTS.MESSAGE, (message) => {
  try {
    if (typeof message.data !== 'string') return;
    const json = JSON.parse(message.data);
    if (json.type === ADD_ELEMENT) {
      const params = json.params as BaseParamsType;
      if (CHECK.params(params)) world.addElement(elementFactory(params) as IElement);
    } else if (json.type === REMOVE_ELEMENT) {
      const id = json.id as number;
      if (CHECK.id(id)) world.removeElement(json.id);
    } else if (json.type === UPDATE_ELEMENT) {
      const params = json.params as BaseParamsType;
      if (CHECK.id(params?.id)) world.updateElement(params.id as number, params);
    } else if (json.type === FORWARD && typeof json.step === 'number') {
      const { id, step } = json;
      if (CHECK.id(id) && CHECK.lineStep(step)) world.forward(id as number, step as number);
    } else if (json.type === BACK) {
      const { id, step } = json;
      if (CHECK.id(id) && CHECK.lineStep(step)) world.back(id as number, step as number);
    } else if (json.type === LEFT) {
      const { id, step } = json;
      if (CHECK.id(id) && CHECK.lineStep(step)) world.left(id as number, step as number);
    } else if (json.type === RIGHT) {
      const { id, step } = json;
      if (CHECK.id(id) && CHECK.lineStep(step)) world.right(id as number, step as number);
    } else if (json.type === ROTATE_LEFT) {
      const { id, step } = json;
      if (CHECK.id(id) && CHECK.rotateStep(step)) world.rotateLeft(id as number, step as number);
    } else if (json.type === ROTATE_RIGHT) {
      const { id, step } = json;
      if (CHECK.id(id) && CHECK.rotateStep(step)) world.rotateRight(id as number, step as number);
    } else if (json.type === VIEW_ANGLE) {
      const { id, viewAngle } = json;
      if (CHECK.id(id) && CHECK.viewAngle(viewAngle)) world.viewAngle(id as number, viewAngle as number);
    } else if (json.type === MESSAGE) {
      const { id, params } = json;
      if (CHECK.id(id) && CHECK.volume(params.volume) && CHECK.text(params.message)) {
        world.message(id as number, params as { message: number, volume?: number });
      }
    } else if (json.type === BITE_OFF) {
      const { id, executor, force } = json;
      if (CHECK.id(id) && CHECK.id(executor) && CHECK.force(force)) {
        world.elementAction(id, { action: 'biteOff', executor, force });
      }
    } else if (json.type === PUSH) {
      const { id, executor, force } = json;
      if (CHECK.id(id) && CHECK.id(executor) && CHECK.force(force)) {
        world.elementAction(id, { action: 'push', executor, force });
      }
    } else if (json.type === PULL) {
      const { id, executor, force } = json;
      if (CHECK.id(id) && CHECK.id(executor) && CHECK.force(force)) {
        world.elementAction(id, { action: 'pull', executor, force });
      }
    } else if (json.type === COMBINE) {
      const { id, executor, additional } = json;
      if (CHECK.id(id) && CHECK.id(executor) && CHECK.id(additional)) {
        world.elementAction(id, { action: 'combine', executor, additional });
      }
    } else if (json.type === BREAK) {
      const { id, executor } = json;
      if (CHECK.id(id) && CHECK.id(executor)) world.elementAction(id, { action: 'break', executor });
    }
  } catch (e) {
    console.log('message error', (e as Error).message);
  }
});

server.addListener(EVENTS.DISCONNECT, (id) => {
  console.log(id);
});
