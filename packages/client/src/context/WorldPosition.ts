import { createContext } from 'react';

export type PositionType = {
  x: number;
  y: number;
};

const WorldPosition = createContext<PositionType>({ x: 0, y: 0 });

export default WorldPosition;
