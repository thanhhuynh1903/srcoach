export const SleepType = {
  UNKNOWN: 0,
  SLEEPING: 2,
  OUT_OF_BED: 3,
  LIGHT: 4,
  DEEP: 5,
  REM: 6,
  AWAKE: 1,
  AWAKE_IN_BED: 7,
} as const;

export type SleepType = (typeof SleepType)[keyof typeof SleepType];

export function getNameFromSleepType(num: SleepType): string {
  const entries = Object.entries(SleepType);
  for (const [key, value] of entries) {
    if (value === num) {
      return key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
  }
  return 'Unknown Sleep Stage';
}

export function getIconFromSleepType(num: SleepType) {
  switch (num) {
    case SleepType.AWAKE:
    case SleepType.AWAKE_IN_BED:
      return "eye-outline";
    case SleepType.LIGHT:
      return "moon-outline";
    case SleepType.DEEP:
      return "bed-outline";
    case SleepType.REM:
      return "flash-outline";
    case SleepType.OUT_OF_BED:
      return "walk-outline";
    case SleepType.SLEEPING:
      return "moon-outline";
    case SleepType.UNKNOWN:
    default:
      return "help-outline";
  }
}