import { TIMEOUT_ERROR } from '@constants/errors';
import appConfig from '@root/appConfig.json';

export const timeout = (
  delay = appConfig.defaultTimeout,
): Promise<void> => new Promise((_, reject) => {
  setTimeout(() => reject(new Error(TIMEOUT_ERROR)), delay);
});
