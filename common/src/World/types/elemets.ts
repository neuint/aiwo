export type PointType = {
  x: number
  y: number
  color?: string
  viewZone?: boolean
};

export type ElementPointType = PointType & {
  id?: number
  viewZone?: boolean
};

export type LineType = {
  start: PointType
  end: PointType
  color?: string
};

export type ElementLineType = LineType & {
  id?: number
  viewZone?: boolean
};

export type BaseParamsType = ElementPointType & {
  label?: string
  viewAngle?: number
  angle?: number
  color?: string
  power?: number
};

export type ElementMessageType = {
  idList: number[];
  message: string;
  sourcePoint: PointType;
};
