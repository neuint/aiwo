import { useState, useEffect } from 'react';

import { t, init, checkInited } from '../i18n';

const useTranslation = (): {
  ready: boolean;
  t: (path: string, options?: { [key: string]: any }) => string;
} => {
  const [ready, update] = useState(checkInited());
  useEffect(() => {
    if (!ready) {
      init()
        .then(() => update(checkInited()))
        .catch(() => update(checkInited()));
    }
  });
  return { ready, t };
};

export default useTranslation;
