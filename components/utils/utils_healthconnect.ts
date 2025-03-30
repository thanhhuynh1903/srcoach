import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initialize,
  readRecord,
  readRecords,
  requestExerciseRoute,
  requestPermission,
} from 'react-native-health-connect';
import { ExerciseType, getNameFromExerciseType } from '../contants/exerciseType';

const api = axios.create({
  baseURL: 'http://192.168.1.8:5000/api',
});

api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface ExerciseSession {
  exerciseType: number;
  clientRecordId: string;
  dataOrigin: string;
  startTime: string;
  endTime: string;
  id: string;
  routes?: ExerciseRouteRecord[];
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
      {accessType: 'read', recordType: 'RestingHeartRate'},
      {accessType: 'read', recordType: 'Distance'},
      {accessType: 'read', recordType: 'ExerciseSession'},
      {accessType: 'read', recordType: 'OxygenSaturation'},
      {accessType: 'read', recordType: 'SleepSession'},
      {accessType: 'write', recordType: 'ExerciseSession'},
    ]);

    return grantedPermissions;
  } catch (error) {
    console.error('Error initializing Health Connect:', error);
    return false;
  }
};

// Helper function to sync data to backend
const syncToBackend = async (endpoint: string, data: any) => {
  try {
    await api.post(endpoint, data);
    console.log(`Successfully synced data to ${endpoint}`);
  } catch (error) {
    console.error(`Error syncing to ${endpoint}:`, error);
  }
};

const syncExerciseSessionToBackend = async (session: ExerciseSession) => {
  try {
    // First create the session
    const sessionResponse = await api.post('/record-exercise-session', {
      exercise_type: session.exerciseType,
      record_id: session.id,
      data_origin: session.dataOrigin,
      start_time: session.startTime,
      end_time: session.endTime,
      client_record_id: session.clientRecordId,
      routes: []
    });

    return sessionResponse.data;
  } catch (error) {
    console.error('Error syncing exercise session:', error);
    throw error;
  }
};

export const fetchStepRecords = async (
  startTime: string,
  endTime: string,
): Promise<StepRecord[]> => {
  try {
    const healthData = await readRecords('Steps', {
      timeRangeFilter: {
        operator: 'between',
        startTime,
        endTime,
      },
    });

    const records = healthData.records.map(record => ({
      count: record.count,
      startTime: record.startTime,
      endTime: record.endTime,
      id: record.metadata?.id || '',
      dataOrigin: record.metadata?.dataOrigin || '',
    }));

    try {
      await syncToBackend('/record-steps', records);
    } catch (error) {
      console.error('Error syncing step records:', error);
    }

    const response = await api.get('/record-steps', {
      params: { startTime, endTime },
    });

    return response.data.data.map((record: any) => ({
      count: record.count,
      startTime: record.start_time,
      endTime: record.end_time,
      id: record.record_id || record.id,
      dataOrigin: record.data_origin,
    }));
  } catch (error) {
    console.error('Error with step records:', error);
    return [];
  }
};

export const fetchDistanceRecords = async (
  startTime: string,
  endTime: string,
): Promise<DistanceRecord[]> => {
  try {
    const healthData = await readRecords('Distance', {
      timeRangeFilter: {
        operator: 'between',
        startTime,
        endTime,
      },
    });

    const records = healthData.records.map(record => ({
      distance: record.distance.inMeters,
      startTime: record.startTime,
      endTime: record.endTime,
      id: record.metadata?.id || '',
      dataOrigin: record.metadata?.dataOrigin || '',
    }));

    try {
      await syncToBackend('/record-distance', records);
    } catch (error) {
      console.error('Error syncing distance records:', error);
    }

    const response = await api.get('/record-distance', {
      params: { startTime, endTime },
    });

    const finalData = response.data.data.map((record: any) => ({
      distance: record.distance,
      startTime: record.start_time,
      endTime: record.end_time,
      id: record.record_id || record.id,
      dataOrigin: record.data_origin,
    }));

    console.log(finalData)

    return finalData
  } catch (error) {
    console.error('Error with distance records:', error);
    return [];
  }
};

export const fetchHeartRateRecords = async (
  startTime: string,
  endTime: string,
): Promise<HeartRateRecord[]> => {
  console.log(startTime)
  try {
    const healthData = await readRecords('HeartRate', {
      timeRangeFilter: {
        operator: 'between',
        startTime,
        endTime,
      },
    });

    const records = healthData.records.flatMap(record =>
      record.samples.map(sample => ({
        beatsPerMinute: sample.beatsPerMinute,
        time: sample.time,
        startTime: sample.time,
        endTime: sample.time,
        id: record.metadata?.id || '',
        dataOrigin: record.metadata?.dataOrigin || '',
      }))
    );

    try {
      await syncToBackend('/record-heart-rate', records);
    } catch (error) {
      console.error('Error syncing heart rate records:', error);
    }

    const response = await api.get('/record-heart-rate', {
      params: { startTime, endTime },
    });

    const finalData = response.data.data.map((record: any) => ({
      beatsPerMinute: record.beats_per_minute,
      time: record.time || record.start_time,
      startTime: record.start_time,
      endTime: record.end_time || record.start_time,
      id: record.record_id || record.id,
      dataOrigin: record.data_origin,
    }));

    return finalData
  } catch (error) {
    console.error('Error with heart rate records:', error);
    return [];
  }
};

export const fetchActiveCaloriesRecords = async (
  startTime: string,
  endTime: string,
): Promise<ActiveCaloriesRecord[]> => {
  try {
    const healthData = await readRecords('ActiveCaloriesBurned', {
      timeRangeFilter: {
        operator: 'between',
        startTime,
        endTime,
      },
    });

    const records = healthData.records.map(record => ({
      calories: record.energy.inCalories,
      startTime: record.startTime,
      endTime: record.endTime,
      id: record.metadata?.id || '',
      dataOrigin: record.metadata?.dataOrigin || '',
    }));

    try {
      await syncToBackend('/record-active-calories', records);
    } catch (error) {
      console.error('Error syncing active calories records:', error);
    }

    const response = await api.get('/record-active-calories', {
      params: { startTime, endTime },
    });

    return response.data.data.map((record: any) => ({
      calories: record.calories,
      startTime: record.start_time,
      endTime: record.end_time,
      id: record.record_id || record.id,
      dataOrigin: record.data_origin,
    }));
  } catch (error) {
    console.error('Error with active calories records:', error);
    return [];
  }
};

export const fetchTotalCaloriesRecords = async (
  startTime: string,
  endTime: string,
): Promise<TotalCaloriesRecord[]> => {
  try {
    const healthData = await readRecords('TotalCaloriesBurned', {
      timeRangeFilter: {
        operator: 'between',
        startTime,
        endTime,
      },
    });

    const records = healthData.records.map(record => ({
      calories: record.energy.inCalories,
      startTime: record.startTime,
      endTime: record.endTime,
      id: record.metadata?.id || '',
      dataOrigin: record.metadata?.dataOrigin || '',
    }));

    try {
      await syncToBackend('/record-total-calories', records);
    } catch (error) {
      console.error('Error syncing total calories records:', error);
    }

    const response = await api.get('/record-total-calories', {
      params: { startTime, endTime },
    });

    return response.data.data.map((record: any) => ({
      calories: record.calories,
      startTime: record.start_time,
      endTime: record.end_time,
      id: record.record_id || record.id,
      dataOrigin: record.data_origin,
    }));
  } catch (error) {
    console.error('Error with total calories records:', error);
    return [];
  }
};

export const fetchExerciseSessionRecords = async (
  startTime: string,
  endTime: string,
): Promise<ExerciseSession[]> => {
  try {

    const healthData = await readRecords('ExerciseSession', {
      timeRangeFilter: {
        operator: 'between',
        startTime,
        endTime,
      },
    });

    // Process basic session data without routes
    const sessions = healthData.records.map(record => ({
      id: record.metadata?.id || '',
      exerciseType: record.exerciseType,
      clientRecordId: record.metadata?.clientRecordId || '',
      dataOrigin: record.metadata?.dataOrigin || '',
      startTime: record.startTime,
      endTime: record.endTime,
      routes: []
    }));

    // Sync basic session data to backend
    await Promise.all(sessions.map(session => 
      syncExerciseSessionToBackend(session).catch(console.error)
    ));

    // Get the final data from backend
    const response = await api.get('/record-exercise-session', {
      params: { startTime, endTime },
    });

    return response.data.data.map((session: any) => ({
      id: session.record_id || session.id,
      exerciseType: session.exercise_type,
      clientRecordId: session.client_record_id,
      dataOrigin: session.data_origin,
      startTime: session.start_time,
      endTime: session.end_time,
      routes: []
    }));

    // return []
  } catch (error) {
    console.error('Error with exercise sessions:', error);
    return [];
  }
};

export const fetchExerciseSessionByRecordId = async (
  recordId: string,
): Promise<ExerciseSession | null> => {
  try {
    const response = await api.get(`/record-exercise-session/record-id/${recordId}`);
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
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching exercise session by record ID:', error);
    return null;
  }
};


// In utils_healthconnect.ts - update the fetchExerciseRoute function
export const fetchExerciseRoute = async (
  sessionId: string, // This should be the normal record ID (id)
): Promise<ExerciseRouteRecord[] | null> => {
  try {
    // First try to get from backend using the session ID
    try {
      const response = await api.get(`/record-exercise-session/${sessionId}/routes`);
      if (response.data.data?.length > 0) {
        return response.data.data.map((route: any) => ({
          time: route.time,
          latitude: route.latitude,
          longitude: route.longitude
        }));
      }
    } catch (error) {
      console.log('No routes found in backend, fetching from Health Connect');
    }

    console.log("Condition passed")

    // If not found in backend, try Health Connect
    const isInitialized = await initializeHealthConnect();
    if (!isInitialized) {
      console.log('Health Connect not initialized');
      return null;
    }

    const granted = await requestPermission([
      {accessType: 'read', recordType: 'ExerciseSession'}
    ]);
    
    if (!granted) {
      console.log('Permission denied for ExerciseRoute');
      return null;
    }

    const routeData = await requestExerciseRoute(sessionId);

    const routes = routeData.map(point => ({
      time: point.time,
      latitude: point.latitude,
      longitude: point.longitude,
    }));

    // Save routes to backend if we have routes
    if (routes.length > 0) {
      try {
        await api.post(`/record-exercise-session/${sessionId}/routes`, { routes });
        console.log('Successfully saved routes to backend');
      } catch (error) {
        console.error('Error saving routes to backend:', error);
      }
    }

    // Return the newly fetched routes
    return routes;
  } catch (error) {
    console.error('Error fetching exercise route:', error);
    return null;
  }
};

export const fetchOxygenSaturationRecords = async (
  startTime: string,
  endTime: string,
): Promise<OxygenSaturationRecord[]> => {
  try {
    const healthData = await readRecords('OxygenSaturation', {
      timeRangeFilter: {
        operator: 'between',
        startTime,
        endTime,
      },
    });

    const records = healthData.records.map(record => ({
      id: record.metadata?.id || '',
      dataOrigin: record.metadata?.dataOrigin || '',
      percentage: record.percentage,
      time: record.time,
      startTime: record.time,
      endTime: record.time,
    }));

    try {
      await syncToBackend('/record-oxygen-saturation', records);
    } catch (error) {
      console.error('Error syncing oxygen saturation records:', error);
    }

    const response = await api.get('/record-oxygen-saturation', {
      params: { startTime, endTime },
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
    console.error('Error with oxygen saturation records:', error);
    return [];
  }
};

export const fetchSleepRecords = async (
  startTime: string,
  endTime: string,
): Promise<SleepSessionRecord[]> => {
  try {
    const healthData = await readRecords('SleepSession', {
      timeRangeFilter: {
        operator: 'between',
        startTime,
        endTime,
      },
    });

    const records = healthData.records.flatMap(record => {
      return record.stages.map(stage => ({
        id: record.metadata?.id || '',
        dataOrigin: record.metadata?.dataOrigin || '',
        stage: stage.stage,
        startTime: stage.startTime,
        endTime: stage.endTime,
      }));
    });

    await syncToBackend('/record-sleep-session', records);

    const response = await api.get('/record-sleep-session', {
      params: {startTime, endTime},
    });

    return response.data.data.map(record => {
      return {
        id: record.record_id,
        startTime: record.start_time,
        endTime: record.end_time,
        stage: record.stage,
        dataOrigin: record.data_origin,
      }
    });
  } catch (error) {
    console.error('Error with sleep records:', error);
    return [];
  }
};

export const fetchRestingHeartRateRecords = async (
  startTime: string,
  endTime: string,
): Promise<RestingHeartRateRecord[]> => {
  try {
    const healthData = await readRecords('RestingHeartRate', {
      timeRangeFilter: {
        operator: 'between',
        startTime,
        endTime,
      },
    });

    const records = healthData.records.map(record => ({
      beatsPerMinute: record.beatsPerMinute,
      time: record.time,
      startTime: startTime,
      endTime: endTime,
      id: record.metadata?.id || '',
      dataOrigin: record.metadata?.dataOrigin || '',
    }));

    await syncToBackend('/record-resting-heart-rate', records);

    const response = await api.get('/record-resting-heart-rate', {
      params: {startTime, endTime},
    });
    return response.data.data;
  } catch (error) {
    console.error('Error with resting heart rate records:', error);
    return [];
  }
};

export const calculateTotalSteps = (steps: StepRecord[]): number => {
  return steps.reduce((total, record) => total + record.count, 0);
};

export const calculateTotalDistance = (
  distanceRecords: DistanceRecord[],
): number => {
  const meters = distanceRecords.reduce(
    (total, record) => total + record.distance,
    0,
  );
  return meters / 1000;
};

export const calculateTotalCalories = (
  caloriesRecords: ActiveCaloriesRecord[] | TotalCaloriesRecord[],
): number => {
  return caloriesRecords.reduce((total, record) => total + record.calories, 0);
};