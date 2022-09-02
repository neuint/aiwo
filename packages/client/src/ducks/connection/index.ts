import { createActions, handleActions } from 'redux-actions';
import { StoreActionType } from '@root/types/redux';

export const CONNECT = 'connection@CONNECT';
export const RECONNECT = 'connection@RECONNECT';
export const DISCONNECT = 'connection@DISCONNECT';
export const CONNECT_ERROR = 'connection@CONNECT_ERROR';
export const CONNECT_SUCCESS = 'connection@CONNECT_SUCCESS';
export const LOGIN = 'connection@LOGIN';
export const LOGIN_ERROR = 'connection@LOGIN_ERROR';
export const LOGIN_SUCCESS = 'connection@LOGIN_SUCCESS';
export const SET_USER = 'connection@SET_USER';

export const {
  connectionConnect,
  connectionReconnect,
  connectionDisconnect,
  connectionConnectError,
  connectionConnectSuccess,
  connectionLogin,
  connectionLoginError,
  connectionLoginSuccess,
  connectionSetUser,
} = createActions(
  CONNECT,
  RECONNECT,
  DISCONNECT,
  CONNECT_ERROR,
  CONNECT_SUCCESS,
  LOGIN,
  LOGIN_ERROR,
  LOGIN_SUCCESS,
  SET_USER,
);

type SuccessConnectPayloadType = { host: string, port: number };

export type StateType = {
  connected: boolean;
  connecting: boolean;
  connectError: string;
  userId: string;
  host: string;
  port: number;
  loggingIn: boolean;
  loginError: string;
};

export const defaultState: StateType = {
  connected: false,
  connecting: false,
  connectError: '',
  userId: '',
  host: '',
  port: 0,
  loggingIn: false,
  loginError: '',
};

export default handleActions({
  [CONNECT]: (state: StateType): StateType => ({
    ...state,
    connecting: true,
    connected: false,
    connectError: '',
    host: '',
    port: 0,
  }),
  [RECONNECT]: (state: StateType): StateType => ({
    ...state,
    connecting: true,
    connected: false,
    connectError: '',
    host: '',
    port: 0,
  }),
  [DISCONNECT]: (state: StateType): StateType => ({
    ...state,
    connecting: false,
    connected: false,
    connectError: '',
    host: '',
    port: 0,
  }),
  [CONNECT_SUCCESS]: (
    state: StateType, { payload }: StoreActionType<SuccessConnectPayloadType | unknown>,
  ): StateType => ({
    ...state,
    connecting: false,
    connected: true,
    host: (payload as SuccessConnectPayloadType)?.host || '',
    port: (payload as SuccessConnectPayloadType)?.port || 0,
  }),
  [CONNECT_ERROR]: (state: StateType, { payload }: StoreActionType<string>): StateType => ({
    ...state,
    connecting: false,
    connected: false,
    connectError: payload,
    host: '',
    port: 0,
  }),
  [LOGIN]: (state: StateType): StateType => ({
    ...state,
    loggingIn: true,
    loginError: '',
  }),
  [LOGIN_SUCCESS]: (state: StateType, { payload }: StoreActionType<string>): StateType => ({
    ...state,
    loggingIn: false,
    userId: payload,
  }),
  [LOGIN_ERROR]: (state: StateType, { payload }: StoreActionType<string>): StateType => ({
    ...state,
    loggingIn: false,
    loginError: payload,
  }),
}, defaultState);
