import { createStore, compose, applyMiddleware, Store } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { get, set, isObject } from 'lodash';

import appConfig from '@root/appConfig.json';
import rootReducer, { reducers, whitelist, rootSaga } from '../ducks';
import StateType from '../ducks/StateType';
import PersistStorage, { PersistType, PersistItemType } from './PersistStorage';

const composeEnhancers = typeof window !== 'undefined'
  ? (window as unknown as any)?.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
  : compose;

const storage = new PersistStorage(Object.keys(reducers).reduce((acc, name) => {
  acc[name as keyof StateType] = reducers[name as keyof StateType].persistStorageType || 'local';
  return acc;
}, {} as { [K in keyof StateType]: 'local' | 'session' }));
const persistData = storage.getItem(appConfig.persistName);

whitelist.forEach(({ name, list }) => {
  const reducer = reducers[name as keyof StateType];
  const info = get(persistData, name);
  if (!isObject(info) || !reducer) return;
  const { defaultState } = reducer;
  list.forEach(([path, postProcessor]) => {
    const val = info[path];
    if (val !== undefined && get(defaultState, path) !== undefined) {
      set(defaultState as StateType[keyof StateType], path, val);
      const [innerPath, innerVal] = postProcessor
        ? postProcessor(defaultState as StateType[keyof StateType])
        : [undefined, undefined];
      if (innerVal !== undefined) {
        set(defaultState as StateType[keyof StateType], innerPath, innerVal);
      }
    }
  });
});

const configureStore = (): Store => {
  const sagaMiddleware = createSagaMiddleware();
  const store = createStore(
    rootReducer,
    {},
    composeEnhancers(applyMiddleware(
      sagaMiddleware,
    )),
  );
  sagaMiddleware.run(rootSaga);
  return store;
};

export const getStore = ((): () => Store => {
  let store: Store | undefined;
  return (): Store => {
    if (store) return store;
    store = configureStore();
    return store;
  };
})();

const persist = (): void => {
  const state = getStore().getState();
  const info: PersistType = whitelist.reduce((acc, { name, list }) => {
    acc[name as keyof StateType] = list.reduce((accInner, [path]) => {
      // eslint-disable-next-line no-param-reassign
      accInner[path] = get(state, `${name}.${path}`);
      return accInner;
    }, {} as PersistItemType);
    return acc;
  }, {} as PersistType);
  storage.setItem(appConfig.persistName, info);
};

if (typeof window !== 'undefined') {
  (window as unknown as { getStore: () => Store }).getStore = getStore;
  window.addEventListener('beforeunload', persist);
}
