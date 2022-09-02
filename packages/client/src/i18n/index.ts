import i18n from 'i18n-js';

import { TYPE_ERROR } from '@root/constants/errors';
import appConfig from '@root/appConfig.json';

const loadInfo = async (): Promise<{ default: string, list: string[] }> => {
  const data = await fetch(appConfig.localeInfoPath);
  if (!data.ok) throw new Error(TYPE_ERROR);
  return data.json();
};

const loadLocale = async (name: string): Promise<{ [key: string]: string }> => {
  const data = await fetch(appConfig.localePathPattern.replace('{{name}}', name));
  if (!data.ok) throw new Error(TYPE_ERROR);
  return data.json();
};

export const init = ((): () => Promise<typeof i18n> => {
  let prom: Promise<typeof i18n> | undefined;
  return (): Promise<typeof i18n> => {
    if (prom) return prom;
    prom = new Promise((resolve, reject) => {
      loadInfo().then((info) => {
        i18n.locale = info.default;
        return loadLocale(info.default).then((locale) => {
          i18n.locale = info.default;
          i18n.translations = { [info.default]: locale };
          resolve(i18n);
        });
      }).catch((err) => {
        reject(err);
      }).finally(() => {
        prom = undefined;
      });
    });
    return prom;
  };
})();

export const checkInited = (): boolean => Boolean(i18n.locale && i18n.translations[i18n.locale]);

export const t = (path: string, options?: { [key: string]: any }): string => i18n.t(path, options);
