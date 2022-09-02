import StateType from '@root/ducks/StateType';

const { localStorage, sessionStorage } = window;

export type PersistItemType = { [key :string]: string | number | boolean | null };
export type PersistType = { [K in keyof StateType]: PersistItemType };

type ReducerDataType = {
  localData: { [K in keyof StateType]: PersistItemType };
  sessionData: { [K in keyof StateType]: PersistItemType };
};

const getStorageParsedData = (data: string | null): { [key: string]: string } | null => {
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

class PersistStorage {
  private readonly reducers: { [key: string]: 'session' | 'local' };

  constructor(reducers: { [key: string]: 'session' | 'local' }) {
    this.reducers = reducers;
  }

  // eslint-disable-next-line class-methods-use-this
  getItem(key: string): { [key: string]: string } | null {
    const localData = getStorageParsedData(localStorage.getItem(key));
    const sessionData = getStorageParsedData(sessionStorage.getItem(key));
    return !localData && !sessionData ? null : {
      ...(localData || {}),
      ...(sessionData || {}),
    };
  }

  setItem(key: string, item: PersistType): void {
    const { localData, sessionData } = Object.keys(item)
      .reduce((acc: ReducerDataType, name): ReducerDataType => {
        if (this.reducers[name] === 'local') {
          acc.localData[name as keyof StateType] = item[name as keyof StateType];
        } else {
          acc.sessionData[name as keyof StateType] = item[name as keyof StateType];
        }
        return acc;
      }, { localData: {}, sessionData: {} } as ReducerDataType);
    localStorage.setItem(key, JSON.stringify(localData));
    sessionStorage.setItem(key, JSON.stringify(sessionData));
  }

  // eslint-disable-next-line class-methods-use-this
  removeItem(key: string): void {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }
}

export default PersistStorage;
