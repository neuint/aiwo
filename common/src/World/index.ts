import EventEmitter from '../EventEmitter';

import IElement from './elements/IElement';
import { BaseParamsType, PointType } from './types/elemets';
import {
  ADD_ELEMENT, COLLISION, REMOVE_ELEMENT, UPDATE_ELEMENT, MESSAGE, COLLAPSE_ELEMENT,
} from './constants/events';
import IWorld from './IWorld';
import { getRadians, getNormalizedAngle } from '../utils/angle';
import { getDistance } from '../utils/point';
import { ACTION_TIMEOUT, STEP_POWER, ACTION_POWER } from './constants/parameters';
import { MATERIALS } from '../constants/materials';
import { BITE_OFF, BREAK, COMBINE, PULL, PUSH } from './constants/actions';
import { LINE_STEP } from './constants/parameters';
import { getElementWeight } from '../utils/element';
import { elementFactory } from './elements';
import { normalizeArea, normalizeSize } from '../utils/size';
import { checkInViewZone } from '../utils/viewZone';

const { WATER_MATERIAL, VEGETABLE_MATERIAL } = MATERIALS;

class World extends EventEmitter implements IWorld {
  private static clearAction(
    elementId: number,
    executorId: number,
    actionExecutor: Map<number, Map<number, ReturnType<typeof setTimeout>>>,
    actionElement: Map<number, number[]>,
  ) {
    const action = actionExecutor.get(executorId);
    if (action) {
      clearTimeout(action.get(elementId));
      action.delete(elementId);
    }
    const actionExecutors = actionElement.get(elementId);
    if (!actionExecutors) return;
    const index = actionExecutors.indexOf(executorId);
    if (index >= 0) actionExecutors.splice(index, 1);
  }

  private elementMap: Map<number, IElement> = new Map<number, IElement>();
  private action: {
    pushExecutor: Map<number, Map<number, ReturnType<typeof setTimeout>>>,
    pushElement: Map<number, number[]>,
    pullExecutor: Map<number, Map<number, ReturnType<typeof setTimeout>>>,
    pullElement: Map<number, number[]>,
  } = {
    pushExecutor: new Map<number, Map<number, ReturnType<typeof setTimeout>>>(),
    pushElement: new Map<number, number[]>(),
    pullExecutor: new Map<number, Map<number, ReturnType<typeof setTimeout>>>(),
    pullElement: new Map<number, number[]>(),
  };

  get elementParamList(): BaseParamsType[] {
    const { elementMap } = this;
    const list: BaseParamsType[] = [];
    const keyIterator = elementMap.keys();
    let key = keyIterator.next().value;
    while (key !== undefined) {
      const item = elementMap.get(key);
      if (item) list.push(item.params);
      key = keyIterator.next().value;
    }
    return list;
  }

  get elements(): IElement[] {
    const { elementMap } = this;
    const list: IElement[] = [];
    const keyIterator = elementMap.keys();
    let key = keyIterator.next().value;
    while (key !== undefined) {
      const item = elementMap.get(key);
      if (item) list.push(item);
      key = keyIterator.next().value;
    }
    return list;
  }

  constructor() {
    super();
    console.log('World is inited');
  }

  private onUpdateElement = (id: number) => {
    this.emit(UPDATE_ELEMENT, id);
  };

  private onCollapseElement = (id: number) => {
    this.removeElement(id);
  }

  private checkInViewZone(element: IElement, targetElement: IElement): boolean {
    return checkInViewZone(element, targetElement, this);
  }

  getElement(id: number): IElement | undefined {
    return this.elementMap.get(id);
  }

  addElement(element: IElement) {
    const { elementMap } = this;
    const { id } = element;
    const keyIterator = elementMap.keys();
    let key = keyIterator.next().value;
    while (key !== undefined) {
      const checkElement = elementMap.get(key);
      if (checkElement?.getCollision(element)) break;
      key = keyIterator.next().value;
    }
    if (key === undefined) {
      elementMap.set(id, element);
      element.addEventListener(UPDATE_ELEMENT, this.onUpdateElement);
      element.addEventListener(COLLAPSE_ELEMENT, this.onCollapseElement);
      this.emit(ADD_ELEMENT, element);
    }
  }

  removeElement(data: number | IElement) {
    const id = typeof data === 'number' ? data : data.id;
    const { elementMap } = this;
    if (!elementMap.get(id)) return;
    elementMap.delete(id);
    this.emit(REMOVE_ELEMENT, id);
  }

  getCollision(element: IElement): { element: IElement, point: PointType } | undefined {
    const { elementMap } = this;
    const { id } = element;
    const keyIterator = elementMap.keys();
    let key = keyIterator.next().value;
    while (key !== undefined) {
      const checkElement = elementMap.get(key);
      if (checkElement?.id !== id) {
        const point = checkElement?.getCollision(element);
        if (point) return { element: checkElement as IElement, point };
      }
      key = keyIterator.next().value;
    }
    return undefined;
  }

  updateElement(data: number | IElement, params: BaseParamsType) {
    const { elementMap } = this;
    const id = typeof data === 'number' ? data : data.id;
    const element = elementMap.get(id);
    if (!element) return;
    const clonedElement = element.clone('left');
    clonedElement?.updateParams(params)
    if (!clonedElement) return;
    const collision = this.getCollision(clonedElement);
    if (collision) {
      this.emit(COLLISION, { idList: [element.id, collision.element.id], point: collision.point });
    } else {
      element.updateParams(params);
    }
  }

  forward(data: number | IElement, step: number) {
    const { elementMap } = this;
    const id = typeof data === 'number' ? data : data.id;
    const element = elementMap.get(id);
    if (!element) return;
    const { params } = element;
    const radians = getRadians(params.angle || 0);
    this.updateElement(element, {
      x: params.x + Math.cos(radians) * step,
      y: params.y + Math.sin(radians) * step,
    });
    element.decreasePower(STEP_POWER);
  }

  back(data: number | IElement, step: number) {
    const { elementMap } = this;
    const id = typeof data === 'number' ? data : data.id;
    const element = elementMap.get(id);
    if (!element) return;
    const { params } = element;
    const radians = getRadians(params.angle || 0);
    this.updateElement(element, {
      x: params.x - Math.cos(radians) * step,
      y: params.y - Math.sin(radians) * step,
    });
    element.decreasePower(STEP_POWER);
  }

  left(data: number | IElement, step: number) {
    const { elementMap } = this;
    const id = typeof data === 'number' ? data : data.id;
    const element = elementMap.get(id);
    if (!element) return;
    const { params } = element;
    const radians = getRadians(params.angle || 0);
    this.updateElement(element, {
      x: params.x + Math.sin(radians) * step,
      y: params.y - Math.cos(radians) * step,
    });
    element.decreasePower(STEP_POWER);
  }

  right(data: number | IElement, step: number) {
    const { elementMap } = this;
    const id = typeof data === 'number' ? data : data.id;
    const element = elementMap.get(id);
    if (!element) return;
    const { params } = element;
    const radians = getRadians(params.angle || 0);
    this.updateElement(element, {
      x: params.x - Math.sin(radians) * step,
      y: params.y + Math.cos(radians) * step,
    });
    element.decreasePower(STEP_POWER);
  }

  rotateLeft(data: number | IElement, step: number) {
    const { elementMap } = this;
    const id = typeof data === 'number' ? data : data.id;
    const element = elementMap.get(id);
    if (!element) return;
    const { params } = element;
    this.updateElement(element, {
      x: params.x,
      y: params.y,
      angle: getNormalizedAngle((params.angle || 0) + step)
    });
    element.decreasePower(STEP_POWER);
  }

  rotateRight(data: number | IElement, step: number) {
    const { elementMap } = this;
    const id = typeof data === 'number' ? data : data.id;
    const element = elementMap.get(id);
    if (!element) return;
    const { params } = element;
    this.updateElement(element, {
      x: params.x,
      y: params.y,
      angle: getNormalizedAngle((params.angle || 0) - step)
    });
    element.decreasePower(STEP_POWER);
  }

  viewAngle(data: number | IElement, viewAngle: number) {
    const { elementMap } = this;
    const id = typeof data === 'number' ? data : data.id;
    const element = elementMap.get(id);
    if (!element) return;
    const { params } = element;
    this.updateElement(element, { viewAngle, x: params.x, y: params.y });
  }

  message(data: number | IElement, params: { message: number, volume?: number }) {
    const { elementMap } = this;
    const id = typeof data === 'number' ? data : data.id;
    const element = elementMap.get(id);
    if (!element) return;
    const { params: { x, y }, area } = element;
    const sourcePoint = { x, y };
    const viewZoneLine = element.getViewZoneLine(0);
    const radius = getDistance(viewZoneLine.start, viewZoneLine.end) * (params.volume || 1);
    const keyIterator = elementMap.keys();
    let key = keyIterator.next().value;
    const idList: number[] = [];
    while (key !== undefined) {
      const checkElement = elementMap.get(key) as IElement;
      const { boxCoordinates: { startX, startY, endX, endY }, polygon, id } = checkElement;
      const points = [
        { x: startX, y: startY },
        { x: startX, y: endY },
        { x: endX, y: endY },
        { x: endX, y: startY },
      ];
      if (points.some((checkPoint) => getDistance(checkPoint, sourcePoint) <= radius)) {
        for (let i = 0, len = polygon.length; i < len; i++) {
          const checkPoint = polygon[i];
          if (getDistance(checkPoint, sourcePoint) <= radius) {
            idList.push(id);
            break;
          }
        }
      }
      key = keyIterator.next().value;
    }
    this.emit(MESSAGE, { idList, message: params.message, sourcePoint });
  }

  private biteOff(element: IElement, executor: IElement, force: number) {
    const { params: { color = '' } } = element;
    if (![WATER_MATERIAL, VEGETABLE_MATERIAL].includes(color)) return;
    if (!this.checkInViewZone(executor, element)) return;
    const isPower = color === WATER_MATERIAL;
    const area = isPower
      ? element.biteOff(executor, force)
      : (element.clone('skip') as IElement).biteOff(executor, force);
    if (!area) return;
    if (isPower) {
      return executor.power += normalizeArea(area);
    }
    const clonedElement = executor.clone('left') as IElement;
    clonedElement.addArea(area);
    const collision = this.getCollision(clonedElement);
    if (!collision) {
      executor.addArea(element.biteOff(executor, force));
    }
  }

  private getExecutorsWidth(list: number[], additional?: IElement): number {
    const { elementMap } = this;
    return  (additional ? getElementWeight(additional) : 0) + list.reduce((acc, id) => {
      const executor = elementMap.get(id);
      return executor ? getElementWeight(executor) + acc : acc;
    }, 0);
  }

  private clearPull = (elementId: number, executorId: number) => {
    const { action: { pullExecutor, pullElement } } = this;
    World.clearAction(elementId, executorId, pullExecutor, pullElement);
  };

  private getPullExecutorsWidth(elementId: number, additional?: IElement): number {
    const { action: { pullElement } } = this;
    const pullExecutors = pullElement.get(elementId) || [];
    return this.getExecutorsWidth(pullExecutors, additional);
  }

  private pull(element: IElement, executor: IElement) {
    if (!this.checkInViewZone(executor, element)) return;
    const { action: { pullExecutor, pullElement } } = this;
    const { id: elementId, params: { x, y } } = element;
    const { id: executorId, params: { angle = 0 } } = executor;
    this.clearPull(elementId, executorId);
    const radians = getRadians(angle);
    const elementWidth = getElementWeight(element);
    const executorWidth = this.getPullExecutorsWidth(elementId, executor);
    executor.decreasePower(STEP_POWER);
    if (elementWidth <= executorWidth) {
      return this.updateElement(element, {
        x: x - Math.cos(radians) * LINE_STEP, y: y - Math.sin(radians) * LINE_STEP,
      });
    }
    let pull = pullExecutor.get(executorId);
    if (!pull) {
      pull = new Map<number, ReturnType<typeof setTimeout>>();
      pullExecutor.set(executorId, pull);
    }
    pull.set(elementId, setTimeout(() => this.clearPull(elementId, executorId), ACTION_TIMEOUT));
    let pullExecutors = pullElement.get(elementId);
    if (!pullExecutors) {
      pullExecutors = [];
      pullElement.set(elementId, pullExecutors);
    }
    pullExecutors.push(executorId);
  }

  private clearPush = (elementId: number, executorId: number) => {
    const { action: { pushExecutor, pushElement } } = this;
    World.clearAction(elementId, executorId, pushExecutor, pushElement);
  };

  private getPushExecutorsWidth(elementId: number, additional?: IElement): number {
    const { action: { pushElement } } = this;
    const pushExecutors = pushElement.get(elementId) || [];
    return this.getExecutorsWidth(pushExecutors, additional);
  }

  private push(element: IElement, executor: IElement) {
    if (!this.checkInViewZone(executor, element)) return;
    const { action: { pushExecutor, pushElement } } = this;
    const { id: elementId, params: { x, y } } = element;
    const { id: executorId, params: { angle = 0 } } = executor;
    this.clearPush(elementId, executorId);
    const radians = getRadians(angle);
    const elementWidth = getElementWeight(element);
    const executorWidth = this.getPushExecutorsWidth(elementId, executor);
    executor.decreasePower(STEP_POWER);
    if (elementWidth <= executorWidth) {
      return this.updateElement(element, {
        x: x + Math.cos(radians) * LINE_STEP, y: y + Math.sin(radians) * LINE_STEP,
      });
    }
    let push = pushExecutor.get(executorId);
    if (!push) {
      push = new Map<number, ReturnType<typeof setTimeout>>();
      pushExecutor.set(executorId, push);
    }
    push.set(elementId, setTimeout(() => this.clearPush(elementId, executorId), ACTION_TIMEOUT));
    let pushExecutors = pushElement.get(elementId);
    if (!pushExecutors) {
      pushExecutors = [];
      pushElement.set(elementId, pushExecutors);
    }
    pushExecutors.push(executorId);
  }

  private break(element: IElement, executor: IElement) {
    const { params: { color = '' } } = element;
    if (![WATER_MATERIAL, VEGETABLE_MATERIAL].includes(color)) return;
    if (!this.checkInViewZone(executor, element) || getElementWeight(element) > getElementWeight(executor)) return;
    const params = element.break(executor);
    if (params) {
      element.updateParams(params[0]);
      this.addElement(elementFactory(params[1]) as IElement);
    }
    executor.decreasePower(ACTION_POWER);
  }

  private combine(first: IElement, second: IElement, executor: IElement) {
    const { area: firstArea } = first;
    const { area: secondArea } = second;
    const { area: executorArea } = executor;
    const isExecutable = this.checkInViewZone(executor, first)
      && this.checkInViewZone(executor, second)
      && executorArea >= secondArea
      && first.params.color === second.params.color;
    if (!isExecutable) return;
    const checkElement = first.clone('left') as IElement;
    if (this.getCollision(checkElement)) return;
    first.addArea(secondArea, true);
    if (normalizeSize(first.area) <= normalizeSize(firstArea)) return;
    this.removeElement(second);
    executor.decreasePower(ACTION_POWER);
  }

  elementAction(
    data: number | IElement,
    params: {
      action: 'push'| 'pull' | 'biteOff' | 'break' | 'combine',
      executor: number,
      additional?: number,
      force?: number,
    },
  ) {
    const { force = 1, executor: executorId, additional: additionalId, action } = params;
    const { elementMap } = this;
    const id = typeof data === 'number' ? data : data.id;
    const element = elementMap.get(id);
    const executor = elementMap.get(executorId);
    const additional = additionalId ? elementMap.get(additionalId) : undefined;
    if (!element || !executor) return;
    if (action === BITE_OFF && force) return this.biteOff(element, executor, force);
    if (action === PUSH) return this.push(element, executor);
    if (action === PULL) return this.pull(element, executor);
    if (action === BREAK) return this.break(element, executor);
    if (action === COMBINE && additional) return this.combine(element, additional, executor);
  }
}

export default World;
