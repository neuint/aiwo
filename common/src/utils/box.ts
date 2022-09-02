export const checkBoxesCollision = (
  first: { startX: number, endX: number, startY: number, endY: number },
  second: { startX: number, endX: number, startY: number, endY: number },
): boolean => {
  const { startX: startXC, endX: endXC, startY: startYC, endY: endYC } = first;
  const { startX: startXE, endX: endXE, startY: startYE, endY: endYE } = second;
  const fullWidth = endXC - startXC + endXE - startXE;
  const fullHeight = endYC - startYC + endYE - startYE;
  const diffX = endXE - startXC;
  const diffY = endYE - startYC;
  return diffX >= 0 && diffX <= fullWidth && diffY >= 0 && diffY <= fullHeight;
};
