export const upperFirst = (str: string): string => {
  const value = str.trim();
  return value.charAt(0).toUpperCase() + value.slice(1);
};
