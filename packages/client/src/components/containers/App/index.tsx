import React, { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';

import View from '@presentations/App';
import WorldHoverContext from '@context/WorldHover';
import WorldBackground from '@root/components/_background/World';
import { getControlElement } from '@ducks/world/selectors';

const App = (): React.ReactElement => {
  const controlElement = useSelector(getControlElement);
  const [hoverList, setHoverList] = useState<string[]>([]);

  const hoverHandler = useCallback((uuidList: string[]) => {
    setHoverList((prevHoverList) => {
      return prevHoverList.length === uuidList.length
        && uuidList.every((uuid) => prevHoverList.includes(uuid)) ? prevHoverList : uuidList;
    });
  }, []);

  return (
    <WorldHoverContext.Provider value={hoverList}>
      <View withInput={Boolean(controlElement)} onHover={hoverHandler} />
      <WorldBackground />
    </WorldHoverContext.Provider>
  );
};

export default App;
