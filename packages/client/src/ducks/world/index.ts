import { createActions, handleActions } from 'redux-actions';
import { StoreActionType } from '@root/types/redux';
import { last } from 'lodash';

import { BaseParamsType, PointType, ElementMessageType } from '@common/World/types/elemets';
import { getLocal } from '@common/utils/point';
import { getRadians } from '@common/utils/angle';

export const SET = 'world@SET';
export const SET_TEMP = 'world@SET_TEMP';
export const NEW = 'world@NEW';
export const EDIT = 'world@EDIT';
export const CREATE = 'world@CREATE';
export const EXPORT = 'world@EXPORT';
export const EXPORT_ERROR = 'world@EXPORT_ERROR';
export const EXPORT_SUCCESS = 'world@EXPORT_SUCCESS';
export const CREATE_SUCCESS = 'world@CREATE_SUCCESS';
export const CREATE_ERROR = 'world@CREATE_ERROR';
export const UPDATE = 'world@UPDATE';
export const UPDATE_SUCCESS = 'world@UPDATE_SUCCESS';
export const UPDATE_ERROR = 'world@UPDATE_ERROR';
export const CLEAR_TEMP = 'world@CLEAR_TEMP';
export const TOGGLE_SELECTION = 'world@TOGGLE_SELECTION';
export const CLEAR_SELECTION = 'world@CLEAR_SELECTION';
export const REMOVE = 'world@REMOVE';
export const CONTROL = 'world@CONTROL';
export const STOP_CONTROL = 'world@STOP_CONTROL';
export const ADD_COLLISION = 'world@ADD_COLLISION';
export const REMOVE_COLLISION = 'world@REMOVE_COLLISION';
export const ADD_HOVER = 'world@ADD_HOVER';
export const REMOVE_HOVER = 'world@REMOVE_HOVER';
export const ADD_MESSAGE = 'world@ADD_MESSAGE';
export const REMOVE_MESSAGE = 'world@REMOVE_MESSAGE';
export const SET_OUT = 'world@SET_OUT';

export const {
  worldSet,
  worldExport,
  worldExportError,
  worldExportSuccess,
  worldSetTemp,
  worldNew,
  worldEdit,
  worldCreate,
  worldCreateSuccess,
  worldCreateError,
  worldClearTemp,
  worldToggleSelection,
  worldRemove,
  worldUpdate,
  worldUpdateSuccess,
  worldUpdateError,
  worldClearSelection,
  worldControl,
  worldStopControl,
  worldAddCollision,
  worldRemoveCollision,
  worldAddHover,
  worldRemoveHover,
  worldAddMessage,
  worldRemoveMessage,
  worldSetOut,
} = createActions(
  SET,
  EXPORT,
  EXPORT_ERROR,
  EXPORT_SUCCESS,
  SET_TEMP,
  NEW,
  EDIT,
  CREATE,
  CREATE_SUCCESS,
  CREATE_ERROR,
  CLEAR_TEMP,
  TOGGLE_SELECTION,
  REMOVE,
  UPDATE,
  UPDATE_SUCCESS,
  UPDATE_ERROR,
  CLEAR_SELECTION,
  CONTROL,
  STOP_CONTROL,
  ADD_COLLISION,
  REMOVE_COLLISION,
  ADD_HOVER,
  REMOVE_HOVER,
  ADD_MESSAGE,
  REMOVE_MESSAGE,
  SET_OUT,
) as {
  worldSet: (payload: BaseParamsType[]) => StoreActionType<BaseParamsType[]>;
  worldExport: (payload: BaseParamsType[]) => StoreActionType<BaseParamsType[]>;
  worldExportError: (payload: string) => StoreActionType<string>;
  worldExportSuccess: () => StoreActionType<undefined>;
  worldSetTemp: (payload: BaseParamsType) => StoreActionType<BaseParamsType>;
  worldCreate: (payload: BaseParamsType) => StoreActionType<BaseParamsType>;
  worldClearTemp: () => StoreActionType<undefined>;
  worldCreateSuccess: () => StoreActionType<undefined>;
  worldCreateError: (payload: string) => StoreActionType<string>;
  worldToggleSelection: (payload: number) => StoreActionType<number>;
  worldNew: (payload: BaseParamsType) => StoreActionType<BaseParamsType>;
  worldEdit: (payload: BaseParamsType) => StoreActionType<BaseParamsType>;
  worldRemove: (payload: number) => StoreActionType<number>;
  worldUpdate: (payload: BaseParamsType) => StoreActionType<BaseParamsType>;
  worldUpdateSuccess: () => StoreActionType<undefined>;
  worldUpdateError: (payload: string) => StoreActionType<string>;
  worldClearSelection: () => StoreActionType<undefined>;
  worldControl: (id: number) => StoreActionType<number>;
  worldStopControl: () => StoreActionType<undefined>;
  worldAddCollision: (
    params: { idList: number[], point: PointType },
  ) => StoreActionType<{ idList: number[], point: PointType }>;
  worldRemoveCollision: (point: PointType) => StoreActionType<PointType>;
  worldAddHover: (id: number) => StoreActionType<number>;
  worldRemoveHover: (id: number) => StoreActionType<number>;
  worldAddMessage: (message: ElementMessageType) => StoreActionType<ElementMessageType>;
  worldRemoveMessage: (id: number) => StoreActionType<number>;
  worldSetOut: (out: number) => StoreActionType<number>;
};

export type StateType = {
  changeIndex: number;
  generating: boolean;
  generateError: string;
  temp?: BaseParamsType;
  tempCreating: boolean;
  tempCreateError: string;
  tempUpdating: boolean;
  tempUpdateError: string;
  selected: number[];
  elements: {
    [key: number]: BaseParamsType;
  };
  control: number;
  collisions: PointType[];
  hovered: number[];
  messages: { [key: number]: ElementMessageType };
  messageList: number[];
  out: number;
};

export const defaultState: StateType = {
  changeIndex: 0,
  generating: false,
  generateError: '',
  temp: undefined,
  tempCreating: false,
  tempCreateError: '',
  tempUpdating: false,
  tempUpdateError: '',
  selected: [],
  elements: {},
  control: 0,
  collisions: [],
  hovered: [],
  messages: {},
  messageList: [],
  out: 1,
};

export default handleActions<StateType, any>({
  [EXPORT]: (state: StateType) => ({
    ...state,
    generating: true,
    generateError: '',
  }),
  [EXPORT_ERROR]: (state: StateType, action: StoreActionType<string>) => ({
    ...state,
    generating: false,
    generateError: action.payload,
  }),
  [EXPORT_SUCCESS]: (state: StateType) => ({
    ...state,
    generating: false,
    generateError: '',
  }),
  [SET_OUT]: (state, { payload }) => ({
    ...state,
    out: payload,
  }),
  [SET]: (state: StateType, action: StoreActionType<BaseParamsType[]>) => {
    const { payload } = action;
    const elements = payload.reduce((acc, element) => {
      if (typeof element.id === 'number') acc[element.id] = element;
      return acc;
    }, {} as { [key: number]: BaseParamsType });
    return {
      ...state,
      elements,
    };
  },
  [SET_TEMP]: (state: StateType, action: StoreActionType<BaseParamsType>) => {
    const { payload } = action;
    return {
      ...state,
      temp: payload as BaseParamsType,
    };
  },
  [NEW]: (state: StateType, action: StoreActionType<BaseParamsType>) => {
    const { payload } = action;
    return {
      ...state,
      changeIndex: state.changeIndex + 1,
      elements: {
        ...state.elements,
        [payload.id as number]: payload,
      },
    };
  },
  [EDIT]: (state: StateType, action: StoreActionType<BaseParamsType>) => {
    const { payload } = action;
    return state.elements[payload.id || -1] ? {
      ...state,
      changeIndex: state.changeIndex + 1,
      elements: {
        ...state.elements,
        [payload.id as number]: payload,
      },
    } : state;
  },
  [UPDATE]: (state: StateType) => {
    return {
      ...state,
      tempUpdating: true,
      tempUpdateError: '',
    };
  },
  [UPDATE_SUCCESS]: (state: StateType) => {
    return {
      ...state,
      temp: undefined,
      tempUpdating: false,
    };
  },
  [UPDATE_ERROR]: (state: StateType, action: StoreActionType<string>) => {
    const { payload } = action;
    return {
      ...state,
      tempUpdating: false,
      tempUpdateError: payload,
    };
  },
  [CREATE]: (state: StateType) => {
    return {
      ...state,
      tempCreating: true,
    };
  },
  [CREATE_SUCCESS]: (state: StateType) => {
    return {
      ...state,
      temp: undefined,
      tempCreating: false,
    };
  },
  [CREATE_ERROR]: (state: StateType, action: StoreActionType<string>) => {
    const { payload } = action;
    return {
      ...state,
      tempCreating: false,
      tempCreateError: payload,
    };
  },
  [CLEAR_TEMP]: (state: StateType) => {
    return {
      ...state,
      temp: undefined,
      tempCreating: false,
      tempCreateError: '',
    };
  },
  [TOGGLE_SELECTION]: (state: StateType, action: StoreActionType<number>) => {
    const { payload } = action;
    const selected = state.selected.includes(payload)
      ? state.selected.filter((id) => id !== payload)
      : [...state.selected, payload];
    return {
      ...state,
      selected,
    };
  },
  [REMOVE]: (state: StateType, action: StoreActionType<number>) => {
    const { payload } = action;
    const elements = Object.keys(state.elements)
      .filter((id) => payload !== Number(id))
      .reduce((acc, id) => {
        acc[Number(id)] = state.elements[Number(id)];
        return acc;
      }, {} as { [key: number]: BaseParamsType });
    const needRemove = state.selected.includes(payload);
    return {
      ...state,
      elements,
      changeIndex: needRemove ? state.changeIndex + 1 : state.changeIndex,
      selected: needRemove ? state.selected.filter((id) => payload !== id) : state.selected,
    };
  },
  [CLEAR_SELECTION]: (state: StateType) => {
    return {
      ...state,
      selected: [],
    };
  },
  [CONTROL]: (state: StateType, action: StoreActionType<number>) => {
    return {
      ...state,
      control: action.payload,
    };
  },
  [STOP_CONTROL]: (state: StateType) => {
    return {
      ...state,
      control: 0,
      collisions: [],
    };
  },
  [ADD_COLLISION]: (
    state: StateType, action: StoreActionType<{ idList: number[], point: PointType }>,
  ) => {
    const { payload: { idList, point } } = action;
    if (!idList.includes(state.control)) return state;
    const controlParams = state.elements[state.control];
    if (!controlParams) return state;
    const { x, y } = getLocal(
      point, { x: controlParams.x, y: controlParams.y }, getRadians(controlParams.angle || 0),
    );
    const filtered = state.collisions.filter((
      checkPoint,
    ) => checkPoint.x !== x || checkPoint.y !== y);
    filtered.push({ x, y });
    return {
      ...state,
      collisions: filtered,
    };
  },
  [REMOVE_COLLISION]: (state: StateType, action: StoreActionType<PointType>) => {
    const { payload: { x, y } } = action;
    return {
      ...state,
      collisions: state.collisions.filter((collision) => collision.x !== x || collision.y !== y),
    };
  },
  [ADD_HOVER]: (state: StateType, action: StoreActionType<number>) => {
    const { payload } = action;
    return {
      ...state,
      hovered: state.hovered.includes(payload) ? state.hovered : [...state.hovered, payload],
    };
  },
  [REMOVE_HOVER]: (state: StateType, action: StoreActionType<number>) => {
    const { payload } = action;
    return {
      ...state,
      hovered: state.hovered.includes(payload)
        ? state.hovered.filter((id) => id !== payload) : state.hovered,
    };
  },
  [ADD_MESSAGE]: (state: StateType, action: StoreActionType<ElementMessageType>) => {
    const { payload } = action;
    const id = (last(state.messageList) || 0) + 1;
    return {
      ...state,
      messageList: [...state.messageList, id],
      messages: {
        ...state.messages,
        [id]: payload,
      },
    };
  },
  [REMOVE_MESSAGE]: (state: StateType, action: StoreActionType<number>) => {
    const { payload } = action;

    return state.messageList.includes(payload) ? {
      ...state,
      messageList: state.messageList.filter((id) => id !== payload),
      messages: Object.keys(state.messages).reduce((acc, id) => {
        if (Number(id) === payload) return acc;
        acc[Number(id)] = state.messages[Number(id)];
        return acc;
      }, {} as { [key: number]: ElementMessageType }),
    } : state;
  },
}, defaultState);
