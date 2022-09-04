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
  toggleHideConsole: () => void;
  isConsoleClosed: boolean;
};

const App: FC<PropsType> = (
  { onHover, toggleHideConsole, isConsoleClosed, withInput = true }: PropsType,
) => {
  const { t } = useTranslation();

  return (
    <div className="App">
      <World onHover={onHover} className="App__world" />
      <div className={cn('App__consoleWrapper', { 'App__consoleWrapper--hidden': isConsoleClosed })}>
        <div className="App__consoleBackgroundWrapper">
          <div className="App__consoleBackgroud" />
        </div>
        <div
          id={MESSAGE_PORTAL_ID}
          className={cn('App__messageInput', { 'App__messageInput--withInput': withInput })}
        />
        {IS_CHROME ? (
          <div className="App__console">
            <button onClick={toggleHideConsole} type="button" className="App__consoleControl">
              {isConsoleClosed ? (
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor" d="M7,15L12,10L17,15H7Z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor" d="M7,10L12,15L17,10H7Z" />
                </svg>
              )}
            </button>
            <Console disabled={isConsoleClosed} />
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
