import React, { FC } from 'react';

import './index.scss';

import { CommonPropsType } from '@root/components/_flows/types';
import AddElementFlow from './Add';
import RemoveElementFlow from './Remove';
import EditElementFlow from './Edit';

const ElementFlow: FC<CommonPropsType> = (props: CommonPropsType) => {
  return (
    <>
      <AddElementFlow {...props} />
      <RemoveElementFlow {...props} />
      <EditElementFlow {...props} />
    </>
  );
};

export default ElementFlow;
