import React, { FC } from 'react';

import { CommonPropsType } from '@root/components/_flows/types';
import ClearSelectionFlow from './ClearSelection';
import ElementControlFlow from './ElementControl';

const WorldFlow: FC<CommonPropsType> = (props: CommonPropsType) => {
  return (
    <>
      <ClearSelectionFlow {...props} />
      <ElementControlFlow {...props} />
    </>
  );
};

export default WorldFlow;
