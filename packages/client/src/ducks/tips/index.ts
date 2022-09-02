import { createActions, handleActions } from 'redux-actions';
import { StoreActionType } from '@root/types/redux';

export const SHOWN = 'tips@SHOWN';
export const CLEAR = 'tips@CLEAR';

export const {
  tipsShown,
  tipsClear,
} = createActions(
  SHOWN,
  CLEAR,
);

export type StateType = {
  shown: {
    [key: string]: boolean | undefined;
  },
};

export const whiteList = [
  'shown',
];

export const defaultState: StateType = {
  shown: {},
};

export default handleActions({
  [SHOWN]: (state: StateType, action: StoreActionType<string>): StateType => {
    const { payload } = action;
    return {
      ...state,
      shown: {
        ...state.shown,
        [payload]: true,
      },
    };
  },
  [CLEAR]: (state: StateType, action: StoreActionType<string>): StateType => {
    const { payload } = action;
    return {
      ...state,
      shown: {
        ...state.shown,
        [payload]: undefined,
      },
    };
  },
}, defaultState);
