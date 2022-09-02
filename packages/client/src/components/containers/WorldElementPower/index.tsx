import React, { FC } from 'react';
import { useSelector } from 'react-redux';

import View from '@presentations/WorldElementPower';
import { getElementById, getHoverList } from '@ducks/world/selectors';
import StateType from '@ducks/StateType';
import { MATERIALS } from '@common/constants/materials';

const WorldElementPower: FC = (): React.ReactElement | null => {
  const hoveredList = useSelector(getHoverList);
  const params = useSelector((state: StateType) => getElementById(state, hoveredList[0] || 0));
  return params?.power !== undefined && params?.color === MATERIALS.PERSON_MATERIAL ? (
    <View value={params?.power} />
  ) : null;
};

export default WorldElementPower;
