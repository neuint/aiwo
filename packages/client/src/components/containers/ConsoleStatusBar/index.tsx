import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { ITerm } from '@neuint/term-js';

import '@neuint/status-bar-plugin-react/dist/index.css';

import StatusBarComponent from '@neuint/status-bar-plugin-react';
import { checkConnected, checkConnecting, getHost } from '@ducks/connection/selectors';
import useTranslation from '@hooks/useTranslation';

type PropsType = {
  term?: ITerm;
};

const ConsoleStatusBar: FC<PropsType> = ({ term }: PropsType) => {
  const { t } = useTranslation();
  const connected = useSelector(checkConnected);
  const connecting = useSelector(checkConnecting);
  const host = useSelector(getHost);

  let status = t('ConsoleStatusBar.disconnected');
  if (connecting) status = t('ConsoleStatusBar.connecting');
  if (connected) status = t('ConsoleStatusBar.connected', { serverHost: host });

  return term ? (
    <StatusBarComponent
      term={term}
      text={status}
    />
  ) : null;
};

export default ConsoleStatusBar;
