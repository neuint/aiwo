import React, { FC } from 'react';
import { useSelector } from 'react-redux';

import { getMessageIdList } from '@ducks/world/selectors';
import WorldMessagesItem from './Item';

type PropsType = {
  scene: THREE.Scene;
};

const WorldMessages: FC<PropsType> = ({ scene }: PropsType) => {
  const idList = useSelector(getMessageIdList);
  return (
    <>
      {idList.map((id: number) => (
        <WorldMessagesItem key={id} id={id} scene={scene} />
      ))}
    </>
  );
};

export default WorldMessages;
