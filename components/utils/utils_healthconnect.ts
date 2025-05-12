import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initialize,
  readRecord,
  readRecords,
  requestExerciseRoute,
  requestPermission,
} from 'react-native-health-connect';
import {ExerciseType, getNameFromExerciseType} from '../contants/exerciseType';
import {MASTER_URL} from './zustandfetchAPI';
import ToastUtil from './utils_toast';

const api = axios.create({
  baseURL: MASTER_URL,
});

api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface ExerciseSession {
  id: string;
  exercise_type: ExerciseType;
  data_origin: string;
  start_time?: string;
  end_time?: string;
  routes?: {
    time: string;
    latitude: number;
    longitude: number;
  }[];
  avg_pace?: number;
  duration_minutes?: number;
  heart_rate?: {
    avg: number;
    min: number;
    max: number;
    records: {
      time: string;
      value: number;
    }[];
  };
  total_distance?: number;
  total_calories?: number;
  total_steps?: number;
}

export interface StepRecord {
  count: number;
  startTime: string;
  endTime: string;
  id: string;
  dataOrigin: string;
}

export interface DistanceRecord {
  distance: number;
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

export interface SleepSessionRecord {
  id: string;
  dataOrigin: string;
  stage: string;
  startTime: string;
  endTime: string;
}

export interface RestingHeartRateRecord {
  time: string;
  beatsPerMinute: number;
  startTime: string;
  endTime: string;
  id: string;
  dataOrigin: string;
}

export const handleSyncButtonPress = async () => {
  let syncMethod = await AsyncStorage.getItem('syncMethod');
  if (!syncMethod) {
    ToastUtil.show('A sync method must be selected first.');
    return {
      type: 'SYNC_METHOD_MISSING',
      message: 'A sync method must be selected first.',
    };
  }
  try {
    await initializeHealthConnect();
  } catch (e) {
    ToastUtil.error(
      'Sync data error',
      'An error occurred while syncing data from Health Connect.',
    );
    return {
      type: 'SYNC_ERROR_HEALTHCONNECT',
      message: 'An error occurred while syncing data from Health Connect.',
    };
  }

  try {
    const now = new Date();
    const endTime = now.toISOString();
    const startTime = new Date();
    startTime.setFullYear(startTime.getFullYear() - 1);
    await startSyncData(startTime.toISOString(), endTime);
  } catch (e) {
    ToastUtil.error(
      'Sync data error',
      'An error occurred while syncing data from Health Connect.',
    );
    return {
      type: 'SYNC_CONNECTION_ERROR_HEALTHCONNECT',
      message: 'An error occurred while syncing data from Health Connect.',
    };
  }

  return {
    type: 'SYNC_SUCCESS',
    message: 'Data synced successfully.',
  };
};

export const initializeHealthConnect = async (): Promise<boolean> => {
  try {
    const isInitialized = await initialize();
    if (!isInitialized) {
      return false;
    }

    const grantedPermissions = await requestPermission([
      {accessType: 'read', recordType: 'Steps'},
      {accessType: 'read', recordType: 'ActiveCaloriesBurned'},
      {accessType: 'read', recordType: 'TotalCaloriesBurned'},
      {accessType: 'read', recordType: 'HeartRate'},
      {accessType: 'read', recordType: 'RestingHeartRate'},
      {accessType: 'read', recordType: 'Distance'},
      {accessType: 'read', recordType: 'ExerciseSession'},
      {accessType: 'read', recordType: 'OxygenSaturation'},
      {accessType: 'read', recordType: 'SleepSession'},
      {accessType: 'write', recordType: 'ExerciseSession'},
    ]);

    return grantedPermissions;
  } catch (error) {
    throw new Error('Failed to initialize HealthConnect');
  }
};

export const startSyncData = async (
  startTime: string,
  endTime: string,
): Promise<boolean> => {
  try {
    const isInitialized = await initializeHealthConnect();
    if (!isInitialized) {
      return false;
    }

    await Promise.all([
      syncStepRecords(startTime, endTime),
      syncDistanceRecords(startTime, endTime),
      syncHeartRateRecords(startTime, endTime),
      syncActiveCaloriesRecords(startTime, endTime),
      syncTotalCaloriesRecords(startTime, endTime),
      syncExerciseSessionRecords(startTime, endTime),
      syncOxygenSaturationRecords(startTime, endTime),
      syncSleepRecords(startTime, endTime),
      syncRestingHeartRateRecords(startTime, endTime),
    ]);

    return true;
  } catch (error) {
    ToastUtil.error(
      'Sync data error',
      'An error occurred while syncing data from Health Connect.',
    );
    return false;
  }
};

const syncStepRecords = async (startTime: string, endTime: string) => {
  const healthData = await readRecords('Steps', {
    timeRangeFilter: {operator: 'between', startTime, endTime},
  });

  const records = healthData.records.map(record => ({
    count: record.count,
    startTime: record.startTime,
    endTime: record.endTime,
    id: record.metadata?.id || '',
    dataOrigin: record.metadata?.dataOrigin || '',
  }));

  if (records.length > 0) {
    await api.post('/record-steps', records);
  }
};

const syncDistanceRecords = async (startTime: string, endTime: string) => {
  const healthData = await readRecords('Distance', {
    timeRangeFilter: {operator: 'between', startTime, endTime},
  });

  const records = healthData.records.map(record => ({
    distance: record.distance.inMeters,
    startTime: record.startTime,
    endTime: record.endTime,
    id: record.metadata?.id || '',
    dataOrigin: record.metadata?.dataOrigin || '',
  }));

  if (records.length > 0) {
    await api.post('/record-distance', records);
  }
};

const syncHeartRateRecords = async (startTime: string, endTime: string) => {
  const healthData = await readRecords('HeartRate', {
    timeRangeFilter: {operator: 'between', startTime, endTime},
  });

  const records = healthData.records.flatMap(record =>
    record.samples.map(sample => ({
      beatsPerMinute: sample.beatsPerMinute,
      time: sample.time,
      startTime: sample.time,
      endTime: sample.time,
      id: record.metadata?.id || '',
      dataOrigin: record.metadata?.dataOrigin || '',
    })),
  );

  if (records.length > 0) {
    await api.post('/record-heart-rate', records);
  }
};

const syncActiveCaloriesRecords = async (
  startTime: string,
  endTime: string,
) => {
  const healthData = await readRecords('ActiveCaloriesBurned', {
    timeRangeFilter: {operator: 'between', startTime, endTime},
  });

  const records = healthData.records.map(record => ({
    calories: record.energy.inCalories,
    startTime: record.startTime,
    endTime: record.endTime,
    id: record.metadata?.id || '',
    dataOrigin: record.metadata?.dataOrigin || '',
  }));

  if (records.length > 0) {
    await api.post('/record-active-calories', records);
  }
};

const syncTotalCaloriesRecords = async (startTime: string, endTime: string) => {
  const healthData = await readRecords('TotalCaloriesBurned', {
    timeRangeFilter: {operator: 'between', startTime, endTime},
  });

  const records = healthData.records.map(record => ({
    calories: record.energy.inCalories,
    startTime: record.startTime,
    endTime: record.endTime,
    id: record.metadata?.id || '',
    dataOrigin: record.metadata?.dataOrigin || '',
  }));

  if (records.length > 0) {
    await api.post('/record-total-calories', records);
  }
};

const syncExerciseSessionRecords = async (
  startTime: string,
  endTime: string,
) => {
  const healthData = await readRecords('ExerciseSession', {
    timeRangeFilter: {operator: 'between', startTime, endTime},
  });

  const sessions = await Promise.all(
    healthData.records.map(async record => {
      let routes: ExerciseRouteRecord[] = [];

      try {
        if (record.exerciseRoute?.type === 'CONSENT_REQUIRED') {
          const {route} = await requestExerciseRoute(record.metadata?.id || '');
          routes = route || [];
        } else {
          routes = record.exerciseRoute?.route || [];
        }
      } catch (error) {
        console.error('Error fetching exercise route:', error);
      }

      return {
        id: record.metadata?.id || '',
        exerciseType: record.exerciseType,
        dataOrigin: record.metadata?.dataOrigin || '',
        startTime: record.startTime,
        endTime: record.endTime,
        routes: routes.map(route => ({
          time: route.time,
          latitude: route.latitude,
          longitude: route.longitude,
        })),
      };
    }),
  );

  if (sessions.length > 0) {
    await Promise.all(
      sessions.map(session => {
        return api.post('/record-exercise-session', {
          exercise_type: session.exerciseType,
          record_id: session.id,
          data_origin: session.dataOrigin,
          start_time: session.startTime,
          end_time: session.endTime,
          routes: session.routes,
        });
      }),
    );
  }
};

const syncOxygenSaturationRecords = async (
  startTime: string,
  endTime: string,
) => {
  const healthData = await readRecords('OxygenSaturation', {
    timeRangeFilter: {operator: 'between', startTime, endTime},
  });

  const records = healthData.records.map(record => ({
    id: record.metadata?.id || '',
    dataOrigin: record.metadata?.dataOrigin || '',
    percentage: record.percentage,
    time: record.time,
    startTime: record.time,
    endTime: record.time,
  }));

  if (records.length > 0) {
    await api.post('/record-oxygen-saturation', records);
  }
};

const syncSleepRecords = async (startTime: string, endTime: string) => {
  const healthData = await readRecords('SleepSession', {
    timeRangeFilter: {operator: 'between', startTime, endTime},
  });

  const records = healthData.records.flatMap(record =>
    record.stages.map(stage => ({
      id: record.metadata?.id || '',
      dataOrigin: record.metadata?.dataOrigin || '',
      stage: stage.stage,
      startTime: stage.startTime,
      endTime: stage.endTime,
    })),
  );

  if (records.length > 0) {
    await api.post('/record-sleep-session', records);
  }
};

const syncRestingHeartRateRecords = async (
  startTime: string,
  endTime: string,
) => {
  const healthData = await readRecords('RestingHeartRate', {
    timeRangeFilter: {operator: 'between', startTime, endTime},
  });

  const records = healthData.records.map(record => ({
    beatsPerMinute: record.beatsPerMinute,
    time: record.time,
    startTime: startTime,
    endTime: endTime,
    id: record.metadata?.id || '',
    dataOrigin: record.metadata?.dataOrigin || '',
  }));

  if (records.length > 0) {
    await api.post('/record-resting-heart-rate', records);
  }
};

export const fetchDetailRecords = async (
  id: string,
): Promise<ExerciseSession> => {
  try {
    const response = await api.get(`/record-exercise-session/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching step records:', error);
    throw error;
  }
};

export const fetchStepRecords = async (
  startTime: string,
  endTime: string,
): Promise<StepRecord[]> => {
  try {
    const response = await api.get('/record-steps', {
      params: {startTime, endTime},
    });
    return response.data.data.map((record: any) => ({
      count: record.count,
      startTime: record.start_time,
      endTime: record.end_time,
      id: record.record_id || record.id,
      dataOrigin: record.data_origin,
    }));
  } catch (error) {
    console.error('Error fetching step records:', error);
    return [];
  }
};

export const fetchDistanceRecords = async (
  startTime: string,
  endTime: string,
): Promise<DistanceRecord[]> => {
  try {
    const response = await api.get('/record-distance', {
      params: {startTime, endTime},
    });
    return response.data.data.map((record: any) => ({
      distance: record.distance,
      startTime: record.start_time,
      endTime: record.end_time,
      id: record.record_id || record.id,
      dataOrigin: record.data_origin,
    }));
  } catch (error) {
    console.error('Error fetching distance records:', error);
    return [];
  }
};

export const fetchHeartRateRecords = async (
  startTime: string,
  endTime: string,
): Promise<HeartRateRecord[]> => {
  try {
    const response = await api.get('/record-heart-rate', {
      params: {startTime, endTime},
    });
    return response.data.data.map((record: any) => ({
      beatsPerMinute: record.beats_per_minute,
      time: record.time || record.start_time,
      startTime: record.start_time,
      endTime: record.end_time || record.start_time,
      id: record.record_id || record.id,
      dataOrigin: record.data_origin,
    }));
  } catch (error) {
    console.error('Error fetching heart rate records:', error);
    return [];
  }
};

export const fetchActiveCaloriesRecords = async (
  startTime: string,
  endTime: string,
): Promise<ActiveCaloriesRecord[]> => {
  try {
    const response = await api.get('/record-active-calories', {
      params: {startTime, endTime},
    });
    return response.data.data.map((record: any) => ({
      calories: record.calories,
      startTime: record.start_time,
      endTime: record.end_time,
      id: record.record_id || record.id,
      dataOrigin: record.data_origin,
    }));
  } catch (error) {
    console.error('Error fetching active calories records:', error);
    return [];
  }
};

export const fetchTotalCaloriesRecords = async (
  startTime: string,
  endTime: string,
): Promise<TotalCaloriesRecord[]> => {
  try {
    const response = await api.get('/record-total-calories', {
      params: {startTime, endTime},
    });
    return response.data.data.map((record: any) => ({
      calories: record.calories,
      startTime: record.start_time,
      endTime: record.end_time,
      id: record.record_id || record.id,
      dataOrigin: record.data_origin,
    }));
  } catch (error) {
    console.error('Error fetching total calories records:', error);
    return [];
  }
};

export const fetchExerciseSessionRecords = async (
  startTime: string,
  endTime: string,
): Promise<ExerciseSession[]> => {
  try {
    const response = await api.get('/record-exercise-session', {
      params: {startTime, endTime},
    });
    return response.data.data.map((session: any) => ({
      id: session.id,
      exerciseType: session.exercise_type,
      dataOrigin: session.data_origin,
      startTime: session.start_time,
      endTime: session.end_time,
      total_distance: session.total_distance,
      duration_minutes: session.duration_minutes,
      total_steps: session.total_steps,
      routes: session.routes || [],
    }));
  } catch (error) {
    console.error('Error fetching exercise sessions:', error);
    return [];
  }
};

export const fetchExerciseSessionById = async (id: string): Promise<any> => {
  try {
    const response = await api.get(`/record-exercise-session/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching exercise session:', error);
    return null;
  }
};

export const fetchExerciseSessionByRecordId = async (
  recordId: string,
): Promise<ExerciseSession | null> => {
  try {
    const response = await api.get(
      `/record-exercise-session/record-id/${recordId}`,
    );
    if (response.data.status === 'success') {
      const session = response.data.data;
      return {
        id: session.record_id || session.id,
        exerciseType: session.exercise_type,
        clientRecordId: session.client_record_id,
        dataOrigin: session.data_origin,
        startTime: session.start_time,
        endTime: session.end_time,
        routes: session.routes || [],
        avgPace: session.avg_pace,
        durationMinutes: session.duration_minutes,
        heartRate: session.heart_rate,
        totalDistance: session.total_distance,
        totalCalories: session.total_calories,
        totalSteps: session.total_steps,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching exercise session:', error);
    return null;
  }
};

export const fetchOxygenSaturationRecords = async (
  startTime: string,
  endTime: string,
): Promise<OxygenSaturationRecord[]> => {
  try {
    const response = await api.get('/record-oxygen-saturation', {
      params: {startTime, endTime},
    });
    return response.data.data.map((record: any) => ({
      id: record.record_id || record.id,
      dataOrigin: record.data_origin,
      percentage: record.percentage,
      time: record.time || record.start_time,
      startTime: record.start_time,
      endTime: record.end_time || record.start_time,
    }));
  } catch (error) {
    console.error('Error fetching oxygen records:', error);
    return [];
  }
};

export const fetchSleepRecords = async (
  startTime: string,
  endTime: string,
): Promise<SleepSessionRecord[]> => {
  try {
    const response = await api.get('/record-sleep-session', {
      params: {startTime, endTime},
    });
    return response.data.data.map(record => ({
      id: record.record_id,
      startTime: record.start_time,
      endTime: record.end_time,
      stage: record.stage,
      dataOrigin: record.data_origin,
      sleepScore: record.sleep_score,
      avgHeartRate: record.avg_heart_rate,
      avgBreathing: record.avg_breathing,
      avgSpO2: record.avg_spo2,
    }));
  } catch (error) {
    console.error('Error fetching sleep records:', error);
    return [];
  }
};

export const fetchRestingHeartRateRecords = async (
  startTime: string,
  endTime: string,
): Promise<RestingHeartRateRecord[]> => {
  try {
    const response = await api.get('/record-resting-heart-rate', {
      params: {startTime, endTime},
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching resting heart rate:', error);
    return [];
  }
};

export const fetchSummaryRecord = async (): Promise<any> => {
  try {
    const response = await api.get('/record-summary');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching summary records:', error);
    return [];
  }
};

export const calculateTotalSteps = (steps: StepRecord[]): number =>
  steps.reduce((total, record) => total + record.count, 0);

export const calculateTotalDistance = (
  distanceRecords: DistanceRecord[],
): number =>
  distanceRecords.reduce((total, record) => total + record.distance, 0) / 1000;

export const calculateTotalCalories = (
  caloriesRecords: ActiveCaloriesRecord[] | TotalCaloriesRecord[],
): number =>
  caloriesRecords.reduce((total, record) => total + record.calories, 0);
