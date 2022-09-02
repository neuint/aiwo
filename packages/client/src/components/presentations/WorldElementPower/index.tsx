import React, { FC } from 'react';

import './WorldElementPower.scss';

type PropsType = {
  value: number;
};

const WorldElementPower: FC<PropsType> = ({ value }: PropsType): React.ReactElement => {
  return (
    <div className="WorldElementPower">
      {value}
    </div>
  );
};

export default WorldElementPower;
