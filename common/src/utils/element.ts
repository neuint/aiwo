import { MATERIALS, DENSITY } from '../constants/materials';
import IElement from '../World/elements/IElement';

const STANDARD_DENSITY = DENSITY.VEGETABLE_MATERIAL;

export const getElementArea = (element: IElement): number => {
  const { polygon } = element;
  const ln = polygon.length;
  if (ln <= 2) return 0;
  const { x: x1, y: y1 } = polygon[0];
  let area = 0;
  for (let i = 2, ln = polygon.length; i < ln; i += 1) {
    const { x: x2, y: y2 } = polygon[i - 1];
    const { x: x3, y: y3 } = polygon[i];
    area += Math.abs((x1 * y2 + x2 * y3 + x3 * y1 - y1 * x2 - y2 * x3 - y3 * x1) / 2);
  }
  return area;
};

export const getElementWeight = (element: IElement): number => {
  const { params: { color } } = element;
  const material = Object.keys(MATERIALS).find((key) => MATERIALS[key] === color);
  const area = getElementArea(element);
  return material ? area * DENSITY[material] : area * Infinity;
};

export const getElementBiteOffIndex = (element: IElement): number => {
  const { params: { color } } = element;
  const material = Object.keys(MATERIALS).find((key) => MATERIALS[key] === color);
  if (!material) return 0;
  const density = DENSITY[material];
  return density ? (STANDARD_DENSITY / density) : 0;
};
