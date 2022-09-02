import { combineReducers, ReducersMapObject, Reducer } from 'redux';
import { all } from 'redux-saga/effects';

import * as tips from '@root/ducks/tips';

import * as world from '@root/ducks/world';
import { watchWorld } from '@root/ducks/world/saga';

import * as connection from '@root/ducks/connection';
import { watchConnection } from '@root/ducks/connection/saga';

import StateType from '@root/ducks/StateType';

type ProcessedWhiteListItemProcessorType = (
  state: StateType[keyof StateType],
) => [string, string | number | boolean | undefined];

export type ProcessedWhiteListItemType = [string, undefined | ProcessedWhiteListItemProcessorType];
export type WhiteListItemType = string | ProcessedWhiteListItemType;
export type ReducerDataType = {
  whiteList?: WhiteListItemType[];
  persistStorageType?: 'local' | 'session';
  defaultState?: StateType[keyof StateType];
  default: Reducer<StateType[keyof StateType]>;
};

export const reducers: { [K in keyof StateType]: ReducerDataType } = {
  connection: connection as unknown as ReducerDataType,
  tips: tips as unknown as ReducerDataType,
  world: world as unknown as ReducerDataType,
};

export const whitelist: { name: keyof StateType; list: ProcessedWhiteListItemType[] }[] = Object
  .keys(reducers)
  .filter((name) => reducers[name as keyof StateType]?.whiteList?.length)
  .map((name): { name: keyof StateType; list: ProcessedWhiteListItemType[] } => ({
    name: name as keyof StateType,
    list: (reducers[name as keyof StateType].whiteList as WhiteListItemType[])
      .map((item: WhiteListItemType): ProcessedWhiteListItemType => {
        return typeof item === 'string' ? [item, undefined] : item;
      }),
  }));

export function* rootSaga(): Generator {
  yield all([
    watchConnection(),
    watchWorld(),
  ]);
}

export default combineReducers(Object.keys(reducers)
  .reduce((acc, name): ReducersMapObject<StateType> => {
    (acc[name as keyof StateType] as Reducer) = reducers[name as keyof StateType].default;
    return acc;
  }, {} as ReducersMapObject<StateType>));
