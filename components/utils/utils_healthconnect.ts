// utils_healthconnect.ts
import {
  initialize,
  readRecord,
  readRecords,
  requestExerciseRoute,
  requestPermission,
} from 'react-native-health-connect';

export interface ExerciseSession {
  exerciseType: number;
  clientRecordId: string;
  dataOrigin: string;
  startTime: string;
  endTime: string;
  id: string;
}

export interface StepRecord {
  count: number;
  startTime: string;
  endTime: string;
  id: string;
  dataOrigin: string;
}

export interface DistanceRecord {
  distance: number; // in meters
  startTime: string;
  endTime: string;
  id: string;
  dataOrigin: string;
}

export interface HeartRateRecord {
  beatsPerMinute: number;
  startTime: string;
  endTime: string;
  id: string;
  dataOrigin: string;
}

export interface ActiveCaloriesRecord {
  calories: number;
  startTime: string;
  endTime: string;
  id: string;
  dataOrigin: string;
}

export interface TotalCaloriesRecord {
  calories: number;
  startTime: string;
  endTime: string;
  id: string;
  dataOrigin: string;
}

export interface ExerciseRouteRecord {
  time: string;
  latitude: number;
  longitude: number;
}

export interface OxygenSaturationRecord {
  time: string;
  percentage: number;
  startTime: string;
  endTime: string;
  id: string;
  dataOrigin: string;
}

// Health Connect Initialization
export const initializeHealthConnect = async (): Promise<boolean> => {
  try {
    const isInitialized = await initialize();
    if (!isInitialized) {
      console.log('Health Connect initialization failed');
      return false;
    }

    const grantedPermissions = await requestPermission([
      {accessType: 'read', recordType: 'Steps'},
      {accessType: 'read', recordType: 'ActiveCaloriesBurned'},
      {accessType: 'read', recordType: 'TotalCaloriesBurned'},
      {accessType: 'read', recordType: 'HeartRate'},
      {accessType: 'read', recordType: 'Distance'},
      {accessType: 'read', recordType: 'ExerciseSession'},
      {accessType: 'write', recordType: 'ExerciseSession'},
    ]);

    return grantedPermissions;
  } catch (error) {
    console.error('Error initializing Health Connect:', error);
    return false;
  }
};

// Exercise Session
export const fetchExerciseSession = async (
  sessionId: string,
): Promise<ExerciseSession | null> => {
  try {
    const session = await readRecord('ExerciseSession', sessionId);
    return {
      exerciseType: session.exerciseType,
      dataOrigin: session.metadata?.dataOrigin || '',
      startTime: session.startTime,
      endTime: session.endTime,
      clientRecordId: session.metadata?.clientRecordId || '',
      id: session.metadata?.id || '',
    };
  } catch (error) {
    console.error('Error fetching exercise session:', error);
    return null;
  }
};

// Steps Data
export const fetchStepRecords = async (
  startTime: string,
  endTime: string,
): Promise<StepRecord[]> => {
  try {
    const result = await readRecords('Steps', {
      timeRangeFilter: {
        operator: 'between',
        startTime,
        endTime,
      },
    });

    return result.records.map(record => ({
      count: record.count,
      startTime: record.startTime,
      endTime: record.endTime,
      id: record.metadata?.id || '',
      dataOrigin: record.metadata?.dataOrigin || '',
    }));
  } catch (error) {
    console.error('Error fetching step records:', error);
    return [];
  }
};

// Distance Data
export const fetchDistanceRecords = async (
  startTime: string,
  endTime: string,
): Promise<DistanceRecord[]> => {
  try {
    const result = await readRecords('Distance', {
      timeRangeFilter: {
        operator: 'between',
        startTime,
        endTime,
      },
    });

    return result.records.map(record => ({
      distance: record.distance.inMeters,
      startTime: record.startTime,
      endTime: record.endTime,
      id: record.metadata?.id || '',
      dataOrigin: record.metadata?.dataOrigin || '',
    }));
  } catch (error) {
    console.error('Error fetching distance records:', error);
    return [];
  }
};

// Heart Rate Data
export const fetchHeartRateRecords = async (
  startTime: string,
  endTime: string,
): Promise<HeartRateRecord[]> => {
  try {
    const result = await readRecords('HeartRate', {
      timeRangeFilter: {
        operator: 'between',
        startTime,
        endTime,
      },
    });

    return result.records.flatMap(record =>
      record.samples.map(sample => ({
        beatsPerMinute: sample.beatsPerMinute,
        startTime: sample.time,
        endTime: sample.time,
        id: record.metadata?.id || '',
        dataOrigin: record.metadata?.dataOrigin || '',
      })),
    );
  } catch (error) {
    console.error('Error fetching heart rate records:', error);
    return [];
  }
};

// Calories Data
export const fetchActiveCaloriesRecords = async (
  startTime: string,
  endTime: string,
): Promise<ActiveCaloriesRecord[]> => {
  try {
    const result = await readRecords('ActiveCaloriesBurned', {
      timeRangeFilter: {
        operator: 'between',
        startTime,
        endTime,
      },
    });

    return result.records.map(record => ({
      calories: record.energy.inCalories,
      startTime: record.startTime,
      endTime: record.endTime,
      id: record.metadata?.id || '',
      dataOrigin: record.metadata?.dataOrigin || '',
    }));
  } catch (error) {
    console.error('Error fetching calories records:', error);
    return [];
  }
};

export const fetchTotalCaloriesRecords = async (
  startTime: string,
  endTime: string,
): Promise<TotalCaloriesRecord[]> => {
  try {
    const result = await readRecords('TotalCaloriesBurned', {
      timeRangeFilter: {
        operator: 'between',
        startTime,
        endTime,
      },
    });

    return result.records.map(record => ({
      calories: record.energy.inCalories,
      startTime: record.startTime,
      endTime: record.endTime,
      id: record.metadata?.id || '',
      dataOrigin: record.metadata?.dataOrigin || '',
    }));
  } catch (error) {
    console.error('Error fetching total calories records:', error);
    return [];
  }
};

// Exercise Route
export const fetchExerciseRoute = async (
  recordId: string,
  clientRecordId: string
): Promise<ExerciseRouteRecord[]> => {
  try {
    const exercise = await readRecord('ExerciseSession', recordId);
    
    if (exercise.exerciseRoute?.type === 'CONSENT_REQUIRED') {
      const { route } = await requestExerciseRoute(clientRecordId);
      if (route) {
        return route.map(point => () => {
          return {
            time: point.time,
            latitude: point.latitude,
            longitude: point.longitude,
          };
        })
      } else {
        console.log('User denied access');
        return [];
      }
    } else {
      let routes = exercise.exerciseRoute?.route.map(point => {
        return {
          time: point.time,
          latitude: point.latitude,
          longitude: point.longitude,
        };
      });
      return routes;
    }
  } catch (error) {
    console.error('Error fetching exercise route:', error);
    return [];
  }
};

export const fetchExerciseSessionRecords = async (
  startTime: string,
  endTime: string,
): Promise<ExerciseSession[]> => {
  try {
    const result = await readRecords('ExerciseSession', {
      timeRangeFilter: {
        operator: 'between',
        startTime,
        endTime,
      },
    });

    return result.records.map(record => ({
      startTime: record.startTime,
      endTime: record.endTime,
      id: record.metadata?.id || '',
      exerciseType: record.exerciseType,
      clientRecordId: record.metadata?.clientRecordId || '',
      dataOrigin: record.metadata?.dataOrigin || '',
    }));
  } catch (error) {
    console.error('Error fetching exercise sessions:', error);
    return [];
  }
};

export const fetchOxygenSaturationRecords = async (
  startTime: string,
  endTime: string,
): Promise<OxygenSaturationRecord[]> => {
  try {
    const result = await readRecords('OxygenSaturation', {
      timeRangeFilter: {
        operator: 'between',
        startTime,
        endTime,
      },
    });

    return result.records.map(record => ({
      time: record.time,
      percentage: record.percentage,
      startTime: startTime,
      endTime: endTime,
      id: record.metadata?.id || '',
      dataOrigin: record.metadata?.dataOrigin || '',
    }));
  } catch (error) {
    console.error('Error fetching oxygen saturation records:', error);
    return [];
  }
};

// Helper function to calculate total steps
export const calculateTotalSteps = (steps: StepRecord[]): number => {
  return steps.reduce((total, record) => total + record.count, 0);
};

// Helper function to calculate total distance in km
export const calculateTotalDistance = (
  distanceRecords: DistanceRecord[],
): number => {
  const meters = distanceRecords.reduce(
    (total, record) => total + record.distance,
    0,
  );
  return meters / 1000;
};

// Helper function to calculate total calories
export const calculateTotalCalories = (
  caloriesRecords: ActiveCaloriesRecord[] | TotalCaloriesRecord[],
): number => {
  return caloriesRecords.reduce((total, record) => total + record.calories, 0);
};
