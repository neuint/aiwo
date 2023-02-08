import React, { FC } from 'react';

import { CommonPropsType } from '@root/components/_flows/types';
import ClearSelectionFlow from './ClearSelection';
import ElementControlFlow from './ElementControl';
import GenerateFlow from './Generate';

const WorldFlow: FC<CommonPropsType> = (props: CommonPropsType) => {
  return (
    <>
      <ClearSelectionFlow {...props} />
      <ElementControlFlow {...props} />
      <GenerateFlow {...props} />
    </>
  );
};

export default WorldFlow;
