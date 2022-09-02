import { MIN_SIZE } from '../constants/size';

const INCREASE = 1 / MIN_SIZE;

export const normalizeSize = (size: number, type: 'ceil' | 'floor' | 'round' = 'round'): number => {
  return Math[type](size * INCREASE) / INCREASE;
};

export const normalizeArea = (size: number, type: 'ceil' | 'floor' | 'round' = 'round'): number => {
  return Math[type](size * INCREASE * INCREASE) / (INCREASE * INCREASE);
};
