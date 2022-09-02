import IEventEmitter from '../EventEmitter/IEventEmitter';
import IElement from './elements/IElement';
import { BaseParamsType, PointType } from './types/elemets';
import IWorldSimple from './IWorldSimple';

export default interface IWorld extends IEventEmitter, IWorldSimple {
  elementParamList: BaseParamsType[];
  getElement(id: number): IElement | undefined;
  addElement(element: IElement): void;
  getCollision(element: IElement): { element: IElement, point: PointType } | undefined;
  removeElement(data: number | IElement): void;
  updateElement(data: number | IElement, params: BaseParamsType): void;
  addEventListener(event: 'addElement', callback: (element: IElement) => void): void;
  addEventListener(event: 'removeElement', callback: (id: number) => void): void;
  addEventListener(event: 'updateElement', callback: (id: number) => void): void;
  addEventListener(event: 'collision', callback: (data: { idList: number[], point: PointType }) => void): void;
  addEventListener(
    event:'message', callback: (data: { idList: number[], message: number, sourcePoint: PointType }) => void,
  ): void;
  forward(data: number | IElement, step: number): void;
  back(data: number | IElement, step: number): void;
  left(data: number | IElement, step: number): void;
  right(data: number | IElement, step: number): void;
  rotateLeft(data: number | IElement, step: number): void;
  rotateRight(data: number | IElement, step: number): void;
  viewAngle(data: number | IElement, step: number): void;
  message(data: number | IElement, params: { message: number, volume: number }): void;
  elementAction(
    data: number | IElement,
    params: {
      action: 'push'| 'pull' | 'biteOff' | 'break' | 'combine',
      executor: number,
      additional?: number,
      force?: number,
    },
  ): void;
}
