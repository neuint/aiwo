export const getRadians = (angle: number): number => angle / 180 * Math.PI;

export const getNormalizedAngle = (angle: number): number => {
  if (angle > 0) {
    return angle - Math.floor(angle / 360) * 360;
  } else if (angle < 0) {
    return angle - Math.floor(angle / 360) * 360;
  }
  return angle;
};
