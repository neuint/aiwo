import StateType from '../StateType';

export const checkConnected = (state: StateType): boolean => state.connection.connected;
export const checkConnecting = (state: StateType): boolean => state.connection.connecting;
export const getConnectError = (state: StateType): string => state.connection.connectError;
export const getHost = (state: StateType): string => state.connection.host;
