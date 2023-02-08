import { put, takeLatest, call } from 'redux-saga/effects';

import * as actions from '@ducks/world';
import { StoreActionType } from '@root/types/redux';
import WorldBridge from '@root/WorldBridge';
import { BaseParamsType } from '@common/World/types/elemets';

export function* createSaga(action: StoreActionType<BaseParamsType>): Generator {
  const bridge = WorldBridge.get();
  bridge.addElement(action.payload);
  yield put(actions.worldCreateSuccess());
}

export function* updateSaga(action: StoreActionType<BaseParamsType>): Generator {
  const bridge = WorldBridge.get();
  bridge.updateElement(action.payload);
  yield put(actions.worldUpdateSuccess());
}

export function* exportSaga(action: StoreActionType<BaseParamsType[]>): Generator {
  const bridge = WorldBridge.get();
  try {
    yield call(bridge.initElements, action.payload);
    yield put(actions.worldExportSuccess());
  } catch (e) {
    yield put(actions.worldExportError((e as Error).message));
  }
}

export function* watchWorld(): Generator {
  yield takeLatest(actions.CREATE, createSaga);
  yield takeLatest(actions.UPDATE, updateSaga);
  yield takeLatest(actions.EXPORT, exportSaga);
}
