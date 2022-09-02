import { call, put, takeLatest, race } from 'redux-saga/effects';

import * as actions from '@ducks/connection';
import WorldBridge from '@root/WorldBridge';
import { timeout } from '@root/utils/actions';
import { StoreActionType } from '@root/types/redux';
import { UNKNOWN_ERROR } from '@constants/errors';
import appConfig from '@root/appConfig.json';

export function* connect(action: StoreActionType<{ host: string, port?: number }>): Generator {
  const { host, port = appConfig.defaultServerPort } = action.payload;
  const bridge = WorldBridge.get(port, host);
  try {
    yield race([call(bridge.init), call(timeout)]);
    yield put(actions.connectionConnectSuccess({ host, port }));
  } catch (err: unknown) {
    bridge.destroy();
    yield put(actions.connectionConnectError((err as Error)?.message || UNKNOWN_ERROR));
  }
}

export function* watchConnection(): Generator {
  yield takeLatest(actions.CONNECT, connect);
}
