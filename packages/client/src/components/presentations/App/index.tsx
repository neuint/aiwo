import React, { FC } from 'react';
import cn from 'classnames';

import './App.scss';

import Console from '@containers/Console';
import World from '@containers/World';
import { MESSAGE_PORTAL_ID } from '@constants/portal';
import useTranslation from '@hooks/useTranslation';

const IS_CHROME = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

type PropsType = {
  onHover: (idList: string[]) => void;
  withInput?: boolean;
};

const App: FC<PropsType> = ({ onHover, withInput = true }: PropsType) => {
  const { t } = useTranslation();
  return (
    <div className="App">
      <World onHover={onHover} className="App__world" />
      <div className="App__consoleWrapper">
        <div className="App__consoleBackgroundWrapper">
          <div className="App__consoleBackgroud" />
        </div>
        <div
          id={MESSAGE_PORTAL_ID}
          className={cn('App__messageInput', { 'App__messageInput--withInput': withInput })}
        />
        {IS_CHROME ? (
          <div className="App__console">
            <Console />
          </div>
        ) : (
          <div className="App__notSupported">
            <span className="App__notSupportedName">{t('_common.aiwo')}</span>
            <span>{t('App.notChrome')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
