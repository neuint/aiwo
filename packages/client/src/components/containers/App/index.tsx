import React, { useState, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';

import View from '@presentations/App';
import WorldHoverContext from '@context/WorldHover';
import WorldBackground from '@root/components/_background/World';
import { getControlElement } from '@ducks/world/selectors';

const App = (): React.ReactElement => {
  const controlElement = useSelector(getControlElement);
  const [hoverList, setHoverList] = useState<string[]>([]);
  const [isConsoleClosed, setConsoleClosed] = useState(false);

  const keyDownHandler = useCallback((ev: KeyboardEvent) => {
    const key = ev.key.toLowerCase();
    if (key === 'arrowup' && ev.ctrlKey && ev.shiftKey) {
      ev.preventDefault();
      ev.stopPropagation();
      setConsoleClosed(false);
    }
    if (key === 'arrowdown' && ev.ctrlKey && ev.shiftKey) {
      ev.preventDefault();
      ev.stopPropagation();
      setConsoleClosed(true);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', keyDownHandler);

    return () => {
      window.removeEventListener('keydown', keyDownHandler);
    };
  }, [keyDownHandler]);

  const hoverHandler = useCallback((uuidList: string[]) => {
    setHoverList((prevHoverList) => {
      return prevHoverList.length === uuidList.length
        && uuidList.every((uuid) => prevHoverList.includes(uuid)) ? prevHoverList : uuidList;
    });
  }, []);

  const toggleHideConsole = useCallback(() => {
    setConsoleClosed((value) => !value);
  }, [setConsoleClosed]);

  return (
    <WorldHoverContext.Provider value={hoverList}>
      <View
        isConsoleClosed={isConsoleClosed}
        withInput={Boolean(controlElement)}
        onHover={hoverHandler}
        toggleHideConsole={toggleHideConsole}
      />
      <WorldBackground />
    </WorldHoverContext.Provider>
  );
};

export default App;
