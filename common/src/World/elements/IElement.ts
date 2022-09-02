import EventEmitter from '../../EventEmitter';

import { BaseParamsType, LineType, PointType } from '../types/elemets';

export default interface IElement extends EventEmitter {
  id: number;
  power: number;
  polygon: PointType[];
  viewZone: PointType[];
  area: number;
  box: { width: number, height: number };
  viewBox: { startX: number, endX: number, startY: number, endY: number };
  boxCoordinates: { startX: number, endX: number, startY: number, endY: number };
  position: PointType;
  baseParams: BaseParamsType;
  params: BaseParamsType;
  getCollision(element: IElement): PointType | undefined;
  updateParams(params: BaseParamsType, forceEmit?: boolean): void;
  clone(id?: 'new' | 'skip' | 'left'): IElement | undefined;
  getViewZoneLine(offsetAngle?: number): LineType;
  biteOff(executor: IElement, force: number): number;
  break(executor: IElement): BaseParamsType[] | undefined;
  addArea(increaseArea: number, simple?: boolean): void;
  decreasePower(amount: number): void;
  checkInViewZone(element: IElement): boolean;
}
