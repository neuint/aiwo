import { PointType } from '../World/types/elemets';

export const rotate = (center: PointType, point: PointType, angle: number): PointType => {
  const s = Math.sin(angle);
  const c = Math.cos(angle);
  const x = point.x - center.x;
  const y = point.y - center.y;
  return { x: x * c - y * s + center.x, y: x * s + y * c + center.y };
};

export const getBox = (points: PointType[]): { topY: number, bottomY: number, leftX: number, rightX: number } => {
  const startPoint = points[0];
  return points.reduce((acc, point) => {
    if (acc.topY < point.y) acc.topY = point.y;
    if (acc.bottomY > point.y) acc.bottomY = point.y;
    if (acc.leftX > point.x) acc.leftX = point.x;
    if (acc.rightX < point.x) acc.rightX = point.x;
    return acc;
  }, { topY: startPoint.y, bottomY: startPoint.y, leftX: startPoint.x, rightX: startPoint.x });
};

export const getDistance = (first: PointType, second: PointType): number => {
  return Math.sqrt(Math.pow(first.x - second.x, 2) + Math.pow(first.y - second.y, 2));
};

export const getLocal = (point: PointType, center: PointType, angle: number): PointType => {
  return {
    x: (point.x - center.x) * Math.cos(angle) + (point.y - center.y) * Math.sin(angle),
    y: -(point.x - center.x) * Math.sin(angle) + (point.y - center.y) * Math.cos(angle),
  };
};

export const getGlobal = (point: PointType, center: PointType, angle: number): PointType => {
  return {
    x: point.x * Math.cos(angle) - point.y * Math.sin(angle) + center.x,
    y: point.x * Math.sin(angle) + point.y * Math.cos(angle) + center.y,
  };
};

export const getBetween = (first: PointType, second: PointType, part: number): PointType => {
  return {
    x: first.x + (second.x - first.x) * part,
    y: first.y + (second.y - first.y) * part,
  };
}
