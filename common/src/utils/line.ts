import { PointType, LineType } from '../World/types/elemets';

type StraightType = {
  k: number
  b: number
  x?: number
  y?: number
};

export const getPolylineLines = (polyline: PointType[]): LineType[] => {
  if (polyline.length === 1) return [{ start: polyline[0], end: polyline[0] }];
  const lines: LineType[] = [];
  const length = polyline.length;
  for (let i = 1; i < length; i += 1) {
    lines.push({ start: polyline[i - 1], end: polyline[i] });
  }
  lines.push({ start: polyline[length - 1], end: polyline[0] });
  return lines;
};

const getStraight = (line: LineType): StraightType => {
  const { start: { x: x1, y: y1 }, end: { x: x2, y: y2 } } = line;
  const k = (y2 - y1) / (x2 - x1);
  const b = y1 - k * x1;
  return { k, b, x: x1 === x2 ? x1 : undefined, y: y1 === y2 ? y1 : undefined };
};

const getStraightsIntersection = (first: StraightType, second: StraightType): PointType => {
  const { k: k1, b: b1, x: x1, y: y1 } = first;
  const { k: k2, b: b2, x: x2, y: y2 } = second;
  if (x1 !== undefined) {
    if (x2 !== undefined) return { x: x1 === x2 ? x1 : NaN, y: NaN };
    if (y2 !== undefined) return { x: x1, y: y2 };
    return { x: x1, y: k2 * x1 + b2 };
  }
  if (y1 !== undefined) {
    if (y2 !== undefined) return { y: y1 === y2 ? y1 : NaN, x: NaN };
    if (x2 !== undefined) return { x: x2, y: y1 };
    return { x: (y1 - b2) / k2, y: y1 };
  }
  const x = (b2 - b1) / (k1 - k2);
  return { x, y: k1 * x + b1 };
};

const checkBetween = (value: number, from: number, to: number): boolean => {
  if (isNaN(value)) return false;
  return from <= to ? value >= from && value <= to : value >= to && value <= from;
};

export const getLinesIntersect = (first: LineType, second: LineType): PointType | undefined => {
  const { start: { x: x11, y: y11 }, end: { x: x12, y: y12 } } = first;
  const { start: { x: x21, y: y21 }, end: { x: x22, y: y22 } } = second;
  const firstStraight = getStraight(first);
  const secondStraight = getStraight(second);
  const { x, y } = secondStraight.b === Infinity || secondStraight.b === -Infinity
    ? getStraightsIntersection(secondStraight, firstStraight)
    : getStraightsIntersection(firstStraight, secondStraight);
  return checkBetween(x, x11, x12)
    && checkBetween(x, x21, x22)
    && checkBetween(y, y11, y12)
    && checkBetween(y, y21, y22) ? { x, y } : undefined;
};

export const checkLinesIntersect = (first: LineType, second: LineType): boolean => {
  const { start: { x: x11, y: y11 }, end: { x: x12, y: y12 } } = first;
  const { start: { x: x21, y: y21 }, end: { x: x22, y: y22 } } = second;
  if ((x11 === x12 && y11 === y12) || (x21 === x22 && y21 === y22)) return true;
  const firstStraight = getStraight(first);
  const secondStraight = getStraight(second);
  if (firstStraight.k === secondStraight.k) {
    return firstStraight.b === secondStraight.b
      && (checkBetween(x21, x11, x12) || checkBetween(x22, x11, x12));
  }
  const { x, y } = getStraightsIntersection(firstStraight, secondStraight);
  return checkBetween(x, x11, x12)
    && checkBetween(x, x21, x22)
    && checkBetween(y, y11, y12)
    && checkBetween(y, y21, y22);
};

export const getPolylinesIntersect = (first: PointType[], second: PointType[]): PointType | undefined => {
  const firstLines = getPolylineLines(first);
  const secondLines = getPolylineLines(second);
  for (let i = 0, firstLenght = firstLines.length; i < firstLenght; i += 1) {
    const firstLine = firstLines[i];
    for (let j = 0, secondLenght = secondLines.length; j < secondLenght; j += 1) {
      const secondLine = secondLines[j];
      const intersect = getLinesIntersect(firstLine, secondLine);
      if (intersect) return intersect;
    }
  }
};
