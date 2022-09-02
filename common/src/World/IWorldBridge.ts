import IWorldSimple from './IWorldSimple';
import IElement from './elements/IElement';
import { BaseParamsType } from './types/elemets';
import IEventEmitter from '../EventEmitter/IEventEmitter';

export default interface IWorldBridge extends IWorldSimple, IEventEmitter {
  init(): Promise<boolean>;
  addElement(params: BaseParamsType): void;
  forward(data: number | IElement, step: number): void;
  back(data: number | IElement, step: number): void;
  rotateLeft(data: number | IElement, step: number): void;
  rotateRight(data: number | IElement, step: number): void;
  left(data: number | IElement, step: number): void;
  right(data: number | IElement, step: number): void;
  removeElement(data: number | IElement): void;
  updateElement(data: BaseParamsType): void;
  viewAngle(data: number | IElement, step: number): void;
  message(data: number | IElement, params: { text: string, volume: number }): void;
  elementAction(
    data: number | IElement,
    params: {
      action: 'push'| 'pull' | 'biteOff' | 'break' | 'combine',
      executor: number,
      additional?: number,
      force?: number,
    },
  ): void;
  destroy(): void;
}
