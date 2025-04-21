export const capitalizeFirstLetter = (str: string) => {
  if (!str) {
    return '';
  }
  return str.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
};
