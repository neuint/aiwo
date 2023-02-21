import IElement from './IElement';
import { BaseParamsType } from '../types/elemets';
import Box from './Box';
import { ParamsType as BoxParamsType } from './Box/types';

let nextId = 1;

export const setNextId = (id: number): void => {
  nextId = id;
};

export const elementFactory = (params: BaseParamsType, id?: 'new' | 'skip' | 'left'): IElement | undefined => {
  if ((params as BoxParamsType).width && (params as BoxParamsType).height) {
    let elementId = nextId;
    if (!id || id === 'new') setNextId(nextId = 1);
    if (id === 'skip') elementId = 0;
    if (id === 'left') elementId = params.id || 0;
    return new Box(elementId, params as BoxParamsType);
  }
};
