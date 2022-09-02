import { last } from 'lodash';

import IElement from '../World/elements/IElement';
import { ElementLineType, ElementPointType, PointType } from '../World/types/elemets';
import { VIEW_ZONE_ANGLE, VIEW_ZONE_ANGLE_POINTS_STEP } from '../World/constants/parameters';
import { getLinesIntersect } from './line';
import { checkBoxesCollision } from './box';
import { getDistance } from './point';
import { MATERIALS } from '../constants/materials';

const checkCommonCollision = (
  viewZoneElement: IElement, checkElement: IElement,
): boolean => {
  return checkBoxesCollision(checkElement.boxCoordinates, viewZoneElement.viewBox);
};

const getElementLines = (element: IElement): ElementLineType[] => {
  const { id, polygon, params: { color } } = element;
  const lines: ElementLineType[] = [];
  polygon.forEach((point: PointType, index: number) => {
    const prevPoint = index === 0 ? last(polygon) : polygon[index - 1];
    const line: ElementLineType = { start: prevPoint as PointType, end: point, color, id };
    lines.push(line);
  });
  return lines;
};

const getViewZonePoints = (
  element: IElement, lines: ElementLineType[],
): ElementPointType[] => {
  const { position } = element;
  const points: ElementPointType[] = [];
  for (
    let offsetAngle = -1 * VIEW_ZONE_ANGLE;
    offsetAngle <= VIEW_ZONE_ANGLE;
    offsetAngle += VIEW_ZONE_ANGLE_POINTS_STEP
  ) {
    const viewZoneLine = element.getViewZoneLine(offsetAngle);
    let point: ElementPointType | undefined = undefined;
    let viewZonePoint: ElementPointType | undefined = undefined;
    let distance = Infinity;
    let viewZoneDistance = Infinity;
    lines.forEach((line: ElementLineType) => {
      const { color, id, viewZone } = line;
      const intersect = getLinesIntersect(line, viewZoneLine);
      if (!intersect) return;
      const checkDistance = getDistance(position, intersect);
      if (viewZone) {
        viewZonePoint = { ...intersect, color, id };
        viewZoneDistance = checkDistance;
        return;
      } else if (!viewZone && viewZonePoint?.id !== id) {
        if (checkDistance < viewZoneDistance) {
          viewZonePoint = undefined;
          viewZoneDistance = Infinity;
        }
      }
      if (point) {
        if (checkDistance < distance) {
          point = { ...intersect, color, id };
          distance = checkDistance;
        }
        point = checkDistance >= distance ? point : intersect;
      } else {
        point = { ...intersect, color, id };
        distance = getDistance(intersect, position);
      }
    });
    if (point) points.push(point);
    if (viewZonePoint) points.push(viewZonePoint);
  }
  return points;
};

const getElementViewZoneLine = (
  element: IElement, elementLines?: ElementLineType[],
): ElementLineType | void => {
  const viewZoneLine = element.getViewZoneLine();
  elementLines = elementLines || getElementLines(element);
  for (let i = 0; i < elementLines.length; i++) {
    const line = elementLines[i];
    const intersect = getLinesIntersect(line, viewZoneLine);
    if (intersect) {
      return {
        id: line.id,
        start: viewZoneLine.start,
        end: intersect,
        color: line.color,
        viewZone: true,
      };
    }
  }
};

export const getViewPointsOfElements = (
  viewZoneElement: IElement, processingElements: IElement[],
): ElementPointType[] => {
  const { id } = viewZoneElement;
  const elementLines = processingElements.filter((checkElement) => {
    if (checkElement.id === id) return false;
    return checkCommonCollision(viewZoneElement, checkElement);
  }).reduce((acc: ElementLineType[], element: IElement) => {
    const lines = getElementLines(element);
    const viewZoneLine = element.params.color === MATERIALS.PERSON_MATERIAL
      ? getElementViewZoneLine(element, lines) : undefined;
    acc.push(...lines);
    if (viewZoneLine) acc.push(viewZoneLine);
    return acc;
  }, [] as ElementLineType[]);
  return getViewZonePoints(viewZoneElement, elementLines);
};

