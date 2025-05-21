export const getNewsColorByType = (type: string): string => {
  switch (type.toUpperCase()) {
    case "OFFICIAL":
      return "#ff0000";
    case "EVENT":
      return "#ff07da";
    case "WARNING":
      return "#ff9800";
    case "MISCELLANEOUS":
      return "#6c757d";
    default:
      return "#6c757d";
  }
};
