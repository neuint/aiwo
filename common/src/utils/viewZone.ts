import { last } from 'lodash';

import IElement from '../World/elements/IElement';
import IWorldSimple from '../World/IWorldSimple';
import { ElementLineType, ElementPointType, PointType } from '../World/types/elemets';
import { checkBoxesCollision } from './box';
import { VIEW_ZONE_ANGLE, VIEW_ZONE_ANGLE_POINTS_STEP } from '../World/constants/parameters';
import { getLinesIntersect } from './line';
import { getDistance } from './point';

export const checkInViewZone = (
  element: IElement, targetElement: IElement, world: IWorldSimple,
): boolean => {
  const { elements } = world;
  const { viewBox, id, position } = element;
  const { id: targetId } = targetElement;
  let isElementInViewZone = false;
  const viewZoneElements = elements.filter((checkElement) => {
    const { id: checkId } = checkElement;
    if (checkId === id) return false;
    const { boxCoordinates } = checkElement;
    const isCollision = checkBoxesCollision(boxCoordinates, viewBox);
    if (isCollision && checkId === targetId) isElementInViewZone = true;
    return isCollision;
  });
  if (!isElementInViewZone) return false;
  const lines: ElementLineType[] = viewZoneElements.reduce((acc, element) => {
    const { polygon, params: { id } } = element;
    polygon.forEach((point: PointType, index: number) => {
      const prevPoint = index === 0 ? last(polygon) : polygon[index - 1];
      const line: ElementLineType = { start: prevPoint as PointType, end: point, id };
      acc.push(line);
    });
    return acc;
  }, [] as ElementLineType[]);
  for (
    let offsetAngle = -1 * VIEW_ZONE_ANGLE;
    offsetAngle <= VIEW_ZONE_ANGLE;
    offsetAngle += VIEW_ZONE_ANGLE_POINTS_STEP
  ) {
    const viewZoneLine = element.getViewZoneLine(offsetAngle);
    let point: ElementPointType | undefined = undefined;
    let distance = Infinity;
    lines.forEach((line: ElementLineType) => {
      const { id } = line;
      const intersect = getLinesIntersect(line, viewZoneLine);
      if (!intersect) return;
      if (point) {
        const checkDistance = getDistance(intersect, position);
        if (checkDistance < distance) {
          point = { ...intersect, id };
          distance = checkDistance;
        }
        point = checkDistance >= distance ? point : intersect;
      } else {
        point = { ...intersect, id };
        distance = getDistance(intersect, position);
      }
    });
    if (point && (point as ElementPointType).id === targetId) return true;
  }
  return false;
};
