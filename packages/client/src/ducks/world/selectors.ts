import { createSelector } from 'reselect';

import { BaseParamsType, PointType, ElementMessageType } from '@common/World/types/elemets';
import StateType from '../StateType';

export const getElements = (
  state: StateType,
): { [key: number]: BaseParamsType } => state.world.elements;

export const checkGenerating = (state: StateType): boolean => state.world.generating;

export const getGenerateError = (state: StateType): string => {
  return state.world.generateError;
};

export const getElementById = (state: StateType, id?: number): BaseParamsType | undefined => {
  return id ? state.world.elements[id] : undefined;
};

export const getControlElement = (state: StateType): BaseParamsType | undefined => {
  return state.world.elements[state.world.control];
};

export const getElementIdList = createSelector([getElements], (elements) => {
  console.log('getElementIdList', elements);

  return Object.keys(elements).map((key) => parseInt(key, 10)).sort();
});

export const getTempElement = (state: StateType): BaseParamsType | undefined => {
  return state.world.temp;
};

export const getTempId = (state: StateType): number => {
  return state.world.temp?.id || -1;
};

export const checkSelected = (state: StateType, id: number): boolean => {
  return state.world.selected.includes(id);
};

export const getSelected = (state: StateType): number[] => {
  return state.world.selected;
};

export const getFirstSelected = createSelector(
  [getSelected, getElements],
  (selected, elements): BaseParamsType | undefined => {
    return selected.length > 0 ? elements[selected[0]] : undefined;
  },
);

export const getControlId = (state: StateType): number => {
  return state.world.control;
};

export const getCollisionPoints = (state: StateType): PointType[] => {
  return state.world.collisions;
};

export const checkHovered = (state: StateType, id: number): boolean => {
  return state.world.hovered.includes(id);
};

export const getHoverList = (state: StateType): number[] => {
  return state.world.hovered;
};

export const getChangeIndex = (state: StateType): number => {
  return state.world.changeIndex;
};

export const getMessageIdList = (state: StateType): number[] => {
  return state.world.messageList;
};

export const getMessage = (state: StateType, id: number): ElementMessageType | undefined => {
  return state.world.messages[id];
};

export const getOut = (state: StateType): number => {
  return state.world.out;
};
