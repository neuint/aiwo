import { useContext } from 'react';

import WorldHover from '@context/WorldHover';
import WorldClick from '@context/WorldClick';

const useMouseInfo = (id: string): [boolean, boolean] => {
  const hoverList = useContext(WorldHover);
  const clickList = useContext(WorldClick);
  const hover = hoverList.includes(id);

  return [hover, hover && clickList.includes(id)];
};

export default useMouseInfo;
