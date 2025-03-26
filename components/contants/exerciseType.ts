export const ExerciseType = {
  OTHER_WORKOUT: 0,
  BADMINTON: 2,
  BASEBALL: 4,
  BASKETBALL: 5,
  BIKING: 8,
  BIKING_STATIONARY: 9,
  BOOT_CAMP: 10,
  BOXING: 11,
  CALISTHENICS: 13,
  CRICKET: 14,
  DANCING: 16,
  ELLIPTICAL: 25,
  EXERCISE_CLASS: 26,
  FENCING: 27,
  FOOTBALL_AMERICAN: 28,
  FOOTBALL_AUSTRALIAN: 29,
  FRISBEE_DISC: 31,
  GOLF: 32,
  GUIDED_BREATHING: 33,
  GYMNASTICS: 34,
  HANDBALL: 35,
  HIGH_INTENSITY_INTERVAL_TRAINING: 36,
  HIKING: 37,
  ICE_HOCKEY: 38,
  ICE_SKATING: 39,
  MARTIAL_ARTS: 44,
  PADDLING: 46,
  PARAGLIDING: 47,
  PILATES: 48,
  RACQUETBALL: 50,
  ROCK_CLIMBING: 51,
  ROLLER_HOCKEY: 52,
  ROWING: 53,
  ROWING_MACHINE: 54,
  RUGBY: 55,
  RUNNING: 56,
  RUNNING_TREADMILL: 57,
  SAILING: 58,
  SCUBA_DIVING: 59,
  SKATING: 60,
  SKIING: 61,
  SNOWBOARDING: 62,
  SNOWSHOEING: 63,
  SOCCER: 64,
  SOFTBALL: 65,
  SQUASH: 66,
  STAIR_CLIMBING: 68,
  STAIR_CLIMBING_MACHINE: 69,
  STRENGTH_TRAINING: 70,
  STRETCHING: 71,
  SURFING: 72,
  SWIMMING_OPEN_WATER: 73,
  SWIMMING_POOL: 74,
  TABLE_TENNIS: 75,
  TENNIS: 76,
  VOLLEYBALL: 78,
  WALKING: 79,
  WATER_POLO: 80,
  WEIGHTLIFTING: 81,
  WHEELCHAIR: 82,
  YOGA: 83,
} as const;

export type ExerciseType = (typeof ExerciseType)[keyof typeof ExerciseType];

export function getNameFromExerciseType(num: ExerciseType): string {
  const entries = Object.entries(ExerciseType);
  for (const [key, value] of entries) {
    if (value === num) {
      return key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
  }
  return 'Unknown Exercise';
}

export function getIconFromExerciseType(num: ExerciseType) {
  switch (num) {
    case ExerciseType.BADMINTON:
      return "tennisball-outline";
    case ExerciseType.BASEBALL:
      return "baseball-outline";
    case ExerciseType.BASKETBALL:
      return "basketball-outline";
    case ExerciseType.BIKING:
    case ExerciseType.BIKING_STATIONARY:
      return "bicycle-outline";
    case ExerciseType.BOOT_CAMP:
      return "fitness-outline";
    case ExerciseType.BOXING:
      return "boxing-glove"; // or "fitness" if not available
    case ExerciseType.CALISTHENICS:
      return "body-outline";
    case ExerciseType.CRICKET:
      return "baseball-outline"; // closest available
    case ExerciseType.DANCING:
      return "musical-notes-outline";
    case ExerciseType.ELLIPTICAL:
      return "ellipsis-horizontal-circle-outline"; // closest
    case ExerciseType.EXERCISE_CLASS:
      return "people-outline";
    case ExerciseType.FENCING:
      return "sword-outline"; // if available
    case ExerciseType.FOOTBALL_AMERICAN:
      return "football-outline";
    case ExerciseType.FOOTBALL_AUSTRALIAN:
      return "football-outline";
    case ExerciseType.FRISBEE_DISC:
      return "disc-outline";
    case ExerciseType.GOLF:
      return "golf-outline";
    case ExerciseType.GUIDED_BREATHING:
      return "leaf-outline";
    case ExerciseType.GYMNASTICS:
      return "body-outline";
    case ExerciseType.HANDBALL:
      return "hand-left-outline"; // closest
    case ExerciseType.HIGH_INTENSITY_INTERVAL_TRAINING:
      return "flash-outline";
    case ExerciseType.HIKING:
      return "walk-outline";
    case ExerciseType.ICE_HOCKEY:
      return "ice-hockey"; // if available
    case ExerciseType.ICE_SKATING:
      return "ice-skate"; // if available
    case ExerciseType.MARTIAL_ARTS:
      return "body-outline";
    case ExerciseType.PADDLING:
      return "boat-outline";
    case ExerciseType.PARAGLIDING:
      return "airplane-outline"; // closest
    case ExerciseType.PILATES:
      return "body-outline";
    case ExerciseType.RACQUETBALL:
      return "tennisball-outline";
    case ExerciseType.ROCK_CLIMBING:
      return "rocket-outline"; // closest
    case ExerciseType.ROLLER_HOCKEY:
      return "hockey-puck"; // if available
    case ExerciseType.ROWING:
    case ExerciseType.ROWING_MACHINE:
      return "boat-outline";
    case ExerciseType.RUGBY:
      return "football-outline";
    case ExerciseType.RUNNING:
    case ExerciseType.RUNNING_TREADMILL:
      return "footsteps-outline";
    case ExerciseType.SAILING:
      return "boat-outline";
    case ExerciseType.SCUBA_DIVING:
      return "water-outline";
    case ExerciseType.SKATING:
      return "skate-outline"; // if available
    case ExerciseType.SKIING:
      return "snow-outline";
    case ExerciseType.SNOWBOARDING:
      return "snow-outline";
    case ExerciseType.SNOWSHOEING:
      return "snow-outline";
    case ExerciseType.SOCCER:
      return "football-outline";
    case ExerciseType.SOFTBALL:
      return "baseball-outline";
    case ExerciseType.SQUASH:
      return "tennisball-outline";
    case ExerciseType.STAIR_CLIMBING:
    case ExerciseType.STAIR_CLIMBING_MACHINE:
      return "stairs-outline";
    case ExerciseType.STRENGTH_TRAINING:
      return "barbell-outline";
    case ExerciseType.STRETCHING:
      return "body-outline";
    case ExerciseType.SURFING:
      return "water-outline";
    case ExerciseType.SWIMMING_OPEN_WATER:
    case ExerciseType.SWIMMING_POOL:
      return "water-outline";
    case ExerciseType.TABLE_TENNIS:
      return "tennisball-outline";
    case ExerciseType.TENNIS:
      return "tennisball-outline";
    case ExerciseType.VOLLEYBALL:
      return "volleyball-outline"; // if available
    case ExerciseType.WALKING:
      return "walk-outline";
    case ExerciseType.WATER_POLO:
      return "water-outline";
    case ExerciseType.WEIGHTLIFTING:
      return "barbell-outline";
    case ExerciseType.WHEELCHAIR:
      return "wheelchair-outline";
    case ExerciseType.YOGA:
      return "body-outline";
    case ExerciseType.OTHER_WORKOUT:
    default:
      return "fitness-outline";
  }
}