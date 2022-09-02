import { put, takeLatest } from 'redux-saga/effects';

import * as actions from '@ducks/world';
import { StoreActionType } from '@root/types/redux';
import WorldBridge from '@root/WorldBridge';
import { BaseParamsType } from '@common/World/types/elemets';

export function* create(action: StoreActionType<BaseParamsType>): Generator {
  const bridge = WorldBridge.get();
  bridge.addElement(action.payload);
  yield put(actions.worldCreateSuccess());
}

export function* update(action: StoreActionType<BaseParamsType>): Generator {
  const bridge = WorldBridge.get();
  bridge.updateElement(action.payload);
  yield put(actions.worldUpdateSuccess());
}

export function* watchWorld(): Generator {
  yield takeLatest(actions.CREATE, create);
  yield takeLatest(actions.UPDATE, update);
}
