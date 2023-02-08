import { last } from 'lodash';

import IElement from '../World/elements/IElement';
import { BaseParamsType, ElementLineType, ElementPointType, PointType } from '../World/types/elemets';
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

const generateElementInfo = (() => {
  const minSize = 10;
  const maxSize = 40;

  return (material: string): BaseParamsType => {

    const width = Math.floor(Math.random() * (maxSize - minSize)) + minSize;
    const height = Math.floor(Math.random() * (maxSize - minSize)) + minSize;
    return {
      width, height, viewAngle: 0, color: material, angle: 0, x: 0, y: 0, power: 10000,
    } as BaseParamsType;
  };
})();

const getMaterial = (() => {
  const allMaterials = Object.values(MATERIALS);
  const withoutCharacterMaterials = Object.values(MATERIALS)
    .filter((material) => material !== MATERIALS.PERSON_MATERIAL);

  return (withoutCharacters: boolean): string => {
    const materials = withoutCharacters ? withoutCharacterMaterials : allMaterials;
    const index = Math.floor(Math.random() * materials.length);
    return materials[index];
  };
})();

const getBoxCoordinates = (
  element: BaseParamsType,
): { startX: number, endX: number, startY: number, endY: number } => {
  const { width, height, x, y } = element as (BaseParamsType & { width: number, height: number });
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  return {
    startX: x - halfWidth,
    endX: x + halfWidth,
    startY: y - halfHeight,
    endY: y + halfHeight,
  }
};

export const generateWorldInfo = (() => {

  const minGroupCount = 1;
  const maxGroupCount = 30;
  const groupCountDiff = maxGroupCount - minGroupCount;
  const minDistance = -100;
  const maxDistance = 100;
  const distanceDiff = maxDistance - minDistance;
  const minGroupDistance = -500;
  const maxGroupDistance = 500;
  const groupDistanceDiff = maxGroupDistance - minGroupDistance;

  return (amount: number, withoutCharacters: boolean): BaseParamsType[] => {
    const elements: BaseParamsType[] = [];
    const boxes: { startX: number, endX: number, startY: number, endY: number }[] = [];
    let x = 0;
    let y = 0;

    while (elements.length < amount) {
      const leftAmount = amount - elements.length;
      const material = getMaterial(withoutCharacters);
      const groupCount = material === MATERIALS.PERSON_MATERIAL ? 1 : Math.min(
        Math.floor(Math.random() * (groupCountDiff)) + minGroupCount,
        leftAmount,
      );
      for (let i = 0; i < groupCount; i++) {
        const element = generateElementInfo(material);
        const xDistance = Math.floor(Math.random() * (distanceDiff)) + minDistance;
        const yDistance = Math.floor(Math.random() * (distanceDiff)) + minDistance;
        x += xDistance;
        y += yDistance;
        element.x = x;
        element.y = y;
        const box = getBoxCoordinates(element);
        const isCollision = boxes.some((checkBox) => {
          return checkBoxesCollision(checkBox, box);
        });
        if (!isCollision) {
          boxes.push(box);
          elements.push(element);
        }
      }
      x += Math.floor(Math.random() * (groupDistanceDiff)) + minGroupDistance;
      y += Math.floor(Math.random() * (groupDistanceDiff)) + minGroupDistance;
    }

    return elements;
  };
})()