/* eslint-disable no-param-reassign */
export const getMinimalRotationGetter = (
  rotateZ: number, startRotateZ: number,
): (part: number) => number => {
  const twoPi = Math.PI * 2;
  const parts = Math.floor(rotateZ / twoPi);
  if (parts) rotateZ -= parts * twoPi;
  const absRotateZDiff = Math.abs(rotateZ - startRotateZ);
  const isBackRotate = absRotateZDiff > Math.PI;
  const direction = rotateZ - startRotateZ > 0 ? -1 : 1;
  const rotateDiff = isBackRotate ? twoPi - absRotateZDiff : rotateZ - startRotateZ;

  return (part: number): number => {
    let partRoatetZ = 0;
    if (isBackRotate) {
      partRoatetZ = startRotateZ + direction * rotateDiff * part;
      if (partRoatetZ < 0) partRoatetZ += twoPi;
      if (partRoatetZ > twoPi) partRoatetZ -= twoPi;
    } else {
      partRoatetZ = startRotateZ + rotateDiff * part;
    }
    return partRoatetZ;
  };
};
