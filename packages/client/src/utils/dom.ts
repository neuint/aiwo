export const getVariableValue = (name: string): string => {
  return getComputedStyle(document.documentElement).getPropertyValue(name);
};
