import { isUndefined } from 'lodash';
import { v1 as uuid } from 'uuid';

import IElement from './IElement';
import { BaseParamsType, PointType } from '../types/elemets';
import { WHITE_COLOR } from '../constants/color';
import { COLLAPSE_ELEMENT, UPDATE_ELEMENT } from '../constants/events';
import { MATERIALS } from '../../constants/materials';
import {
  VIEW_ZONE_ANGLE,
  VIEW_ZONE_INCREASE,
  DEFAULT_POWER,
  VIEW_ZONE_ANGLE_POINTS_STEP
} from '../constants/parameters';
import { getBox, rotate, getDistance } from '../../utils/point';
import { getLinesIntersect, getPolylineLines, getPolylinesIntersect } from '../../utils/line';
import EventEmitter from '../../EventEmitter';
import { checkBoxesCollision } from '../../utils/box';

const { VEGETABLE_MATERIAL, WATER_MATERIAL } = MATERIALS;

export default abstract class BaseElement extends EventEmitter implements IElement {
  protected abstract get originPolygon(): PointType[];

  abstract get area(): number;

  get polygon(): PointType[] {
    return this.originPolygon.map((p) => {
      const { angle, centerPosition } = this;
      return rotate(centerPosition, p, Math.PI / 180 * angle);
    });
  }

  get viewZone(): PointType[] {
    const { centerPosition, centerPosition: { x, y } } = this;
    let fullAngle = this.viewAngle + this.angle;
    if (fullAngle > 360) fullAngle = fullAngle % 360;

    const angle = Math.PI / 180 * fullAngle;
    const length = Math.sqrt(this.area) * VIEW_ZONE_INCREASE;
    const height = length * Math.tan(Math.PI / 180 * VIEW_ZONE_ANGLE);
    const top: PointType = { x: length + x, y: y + height };
    const bottom: PointType = {x: length + x, y: y - height };
    return [
      rotate(centerPosition, { x, y }, angle),
      rotate(centerPosition, top, angle),
      rotate(centerPosition, bottom, angle),
    ];
  }

  get id(): number {
    return this.idProperty;
  }

  get box(): { width: number, height: number } {
    const { polygon } = this;
    const { topY, bottomY, leftX, rightX } = getBox(polygon);
    return {
      width: Math.abs(rightX - leftX),
      height: Math.abs(topY - bottomY),
    };
  }

  get viewBox(): { startX: number, endX: number, startY: number, endY: number } {
    const { viewZone } = this;
    const { topY, bottomY, leftX, rightX } = getBox(viewZone);
    return { startX: leftX, endX: rightX, startY: bottomY, endY: topY };
  }

  get boxCoordinates(): { startX: number, endX: number, startY: number, endY: number } {
    const { width, height } = this.box;
    const { x, y } = this.centerPosition;
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    return { startX: x - halfWidth, endX: x + halfWidth, startY: y - halfHeight, endY: y + halfHeight };
  }

  get position(): PointType {
    const { x, y } = this.centerPosition;
    return { x, y };
  }

  get baseParams(): BaseParamsType {
    const { angle, viewAngle, color, label, power, centerPosition: { x, y } } = this;
    return { angle, viewAngle, color, x, y, label, power, id: this.id };
  }

  get power(): number {
    return this.powerField;
  }

  set power(value: number) {
    const power = Math.max(value, 0);
    if (this.powerField !== power) {
      this.powerField = Math.max(value, 0);
      this.emit(UPDATE_ELEMENT, this.id);
    }
  }

  abstract get params(): BaseParamsType;

  protected viewAngle: number = 0;
  protected centerPosition: PointType = { x: 0, y: 0 };
  protected angle: number;
  protected color: string;
  protected idProperty: number;
  protected label: string;

  private powerField: number;

  protected constructor(id: number, params: BaseParamsType) {
    super();
    this.idProperty = id;
    this.centerPosition.x = params.x || 0;
    this.centerPosition.y = params.y || 0;
    this.angle = params.angle || 0;
    this.powerField = params.power || DEFAULT_POWER;
    this.viewAngle = params.viewAngle || 0;
    this.color = params.color || WHITE_COLOR;
    this.label = params.label || '';
  }

  getCollision(element: IElement): PointType | undefined {
    if (!checkBoxesCollision(this.boxCoordinates, element.boxCoordinates)) return undefined;
    return getPolylinesIntersect(this.polygon, element.polygon);
  }

  updateParams(params: BaseParamsType, forceEmit?: boolean) {
    const { centerPosition, viewAngle, angle, color, label = uuid(), centerPosition: { x, y } } = this;
    const xUpdated = isUndefined(params.x) ? x : params.x;
    const yUpdated = isUndefined(params.y) ? y : params.y;
    const viewAngleUpdated = isUndefined(params.viewAngle) ? viewAngle : params.viewAngle;
    const angleUpdated = isUndefined(params.angle) ? angle : params.angle;
    const colorUpdated = isUndefined(params.color) ? color : params.color;
    const labelUpdated = isUndefined(params.label) ? label : params.label;
    let isUpdated = false;
    if (xUpdated !== x) {
      centerPosition.x = xUpdated;
      isUpdated = true;
    }
    if (viewAngleUpdated !== viewAngle) {
      this.viewAngle = viewAngleUpdated;
      isUpdated = true;
    }
    if (yUpdated !== y) {
      centerPosition.y = yUpdated;
      isUpdated = true;
    }
    if (angleUpdated !== angle) {
      this.angle = angleUpdated;
      isUpdated = true;
    }
    if (colorUpdated !== color) {
      this.color = colorUpdated;
      isUpdated = true;
    }
    if (labelUpdated !== label) {
      this.label = labelUpdated;
      isUpdated = true;
    }
    if (!this.area) return this.emit(COLLAPSE_ELEMENT, this.id);
    if (isUpdated || forceEmit) this.emit(UPDATE_ELEMENT, this.id);
  }

  getViewZoneLine(offsetAngle?: number): { start: PointType, end: PointType } {
    if (!offsetAngle) {
      offsetAngle = 0;
    } else if (offsetAngle > VIEW_ZONE_ANGLE) {
      offsetAngle = VIEW_ZONE_ANGLE;
    } else if (offsetAngle < -1 * VIEW_ZONE_ANGLE) {
      offsetAngle = -1 * VIEW_ZONE_ANGLE;
    }
    const { centerPosition, centerPosition: { x, y } } = this;
    let fullAngle = this.viewAngle + this.angle - offsetAngle;
    const length = Math.sqrt(this.area) * VIEW_ZONE_INCREASE;
    if (fullAngle > 360) fullAngle = fullAngle % 360;
    if (fullAngle < 0) fullAngle = 360 + fullAngle;
    return {
      start: { x, y },
      end: rotate(centerPosition, { x: x + length, y }, Math.PI / 180 * fullAngle),
    };
  }

  protected canBiteOff(): boolean {
    const { color } = this.params;
    return color === VEGETABLE_MATERIAL || color === WATER_MATERIAL;
  }

  checkInViewZone(element: IElement): boolean {
    if (!checkBoxesCollision(this.viewBox, element.boxCoordinates)) return false;
    const lines = getPolylineLines(element.polygon);
    for (
      let offsetAngle = -1 * VIEW_ZONE_ANGLE;
      offsetAngle <= VIEW_ZONE_ANGLE;
      offsetAngle += VIEW_ZONE_ANGLE_POINTS_STEP) {
      const viewZoneLine = this.getViewZoneLine(offsetAngle);
      if (lines.some((line) => getLinesIntersect(line, viewZoneLine))) {
        return true;
      }
    }
    return false;
  }

  abstract clone(id?: 'new' | 'skip' | 'left'): IElement | undefined;

  abstract biteOff(executor: IElement, force: number): number;

  abstract addArea(increaseArea: number, simple?: boolean): void;

  abstract decreasePower(amount: number): void;

  abstract break(executor: IElement): BaseParamsType[] | undefined;
}
