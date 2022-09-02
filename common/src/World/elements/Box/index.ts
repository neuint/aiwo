import { isUndefined, omit } from 'lodash';

import IElement from '../IElement';
import BaseElement from '../BaseElement';
import { PointType } from '../../types/elemets';
import { DEFAULT_SIZE } from './constants';
import { MIN_SIZE } from '../../../constants/size';
import { BITE_OFF_INDEX } from '../../constants/parameters';
import { elementFactory } from '../index';
import { getElementBiteOffIndex } from '../../../utils/element';
import { normalizeSize } from '../../../utils/size';

import { ParamsType } from './types';
import { getRadians } from '../../../utils/angle';

const MIN_AREA = MIN_SIZE * MIN_SIZE;

export default class Box extends BaseElement implements IElement {
  private width = 0;
  private height = 0;

  get params(): ParamsType {
    return { ...this.baseParams, width: this.width, height: this.height };
  }

  get area(): number {
    return this.width * this.height;
  }

  protected get originPolygon(): PointType[] {
    const { width, height, centerPosition } = this;
    const { x, y } = centerPosition;
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    return [
      { x: x + halfWidth, y: y + halfHeight },
      { x: x + halfWidth, y: y - halfHeight },
      { x: x - halfWidth, y: y - halfHeight },
      { x: x - halfWidth, y: y + halfHeight },
    ];
  }

  constructor(id: number, params: ParamsType) {
    super(id, params);
    this.width = params.width || DEFAULT_SIZE;
    this.height = params.height || DEFAULT_SIZE;
  }

  private decreaseArea(value: number): number {
    const { area, width: currentWidth, height: currentHeight, centerPosition: { x, y } } = this;
    const updatedArea = area - value;
    if (updatedArea <= MIN_AREA) {
      this.updateParams({ width: 0, height: 0, x, y });
      return area;
    }
    const b = (2 * currentHeight + 2 * currentWidth);
    const decreaseSize = normalizeSize((b - Math.sqrt(Math.pow(b, 2) - 16 * value)) / 8, 'floor');
    const width = currentWidth - decreaseSize;
    const height = currentHeight - decreaseSize;
    this.updateParams({ width, height, x, y });
    return area - width * height;
  }

  updateParams(params: ParamsType) {
    const { width, height } = this;
    const widthUpdated = isUndefined(params.width) ? width : params.width;
    const heightUpdated = isUndefined(params.height) ? height : params.height;
    let isUpdated = false;
    if (widthUpdated !== width) {
      this.width = widthUpdated;
      isUpdated = true;
    }
    if (heightUpdated !== height) {
      this.height = heightUpdated;
      isUpdated = true;
    }
    super.updateParams(params, isUpdated);
  }

  clone(id?: 'new' | 'skip' | 'left'): IElement | undefined {
    return elementFactory({
      id: this.id,
      x: this.centerPosition.x,
      y: this.centerPosition.y,
      angle: this.angle,
      color: this.color,
      width: this.width,
      height: this.height,
    } as ParamsType, id);
  }

  biteOff(executor: IElement, force: number): number {
    if (!this.canBiteOff()) return 0;
    const biteOffArea = BITE_OFF_INDEX * force * executor.area * getElementBiteOffIndex(this);
    return this.decreaseArea(biteOffArea);
  }

  addArea(increaseArea: number, simple: boolean = false) {
    const { area, width: currentWidth, height: currentHeight, centerPosition: { x, y } } = this;
    if (simple) {
      const halfPerimeter = currentWidth + currentHeight;
      const increaseSize = normalizeSize(
        (-1 * halfPerimeter + Math.sqrt(Math.pow(halfPerimeter, 2) + 4 * increaseArea)) / 2, 'floor',
      );
      this.updateParams({ width: currentWidth + increaseSize, height: currentHeight + increaseSize, x, y });
    } else {
      const sizeIndex = currentWidth / currentHeight;
      const increaseSize = Math.sqrt(area + increaseArea);
      const width = normalizeSize(sizeIndex * increaseSize, 'floor');
      const height = normalizeSize(increaseSize / sizeIndex, 'floor');
      this.updateParams({ width, height, x, y });
    }
  }

  decreasePower(amount: number) {
    const { power } = this;
    const rest = power - amount;
    if (rest >= 0) {
      this.power = rest;
    } else {
      this.decreaseArea(rest * -1);
    }
  }

  break(executor: IElement): ParamsType[] | undefined {
    const { width, height, angle, params, centerPosition: { x, y } } = this;
    const radians = getRadians(angle);
    const isLandscape = width >= height;

    const part = isLandscape ? width / 2 - MIN_SIZE : height / 2 - MIN_SIZE;
    if (part <= 0) return undefined;
    const offset = MIN_SIZE + part / 2;
    const horizontal = offset * (isLandscape ? Math.cos(radians) : Math.sin(radians));
    const vertical = offset * (isLandscape ? Math.sin(radians) : Math.cos(radians));
    delete params.id;
    const mainData = isLandscape ? { ...params, height, width: part } : { ...params, width, height: part };
    return [
      { ...mainData, x: x + horizontal, y: y + vertical },
      { ...mainData, x: x - horizontal, y: y - vertical },
    ];
  }
}
